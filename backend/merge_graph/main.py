import time
import json
import numpy as np
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from itext2kg.utils import Matcher
from itext2kg.models import Entity, Relationship, KnowledgeGraph
from itext2kg.graph_integration import GraphIntegrator
from langchain_huggingface import HuggingFaceEmbeddings

load_dotenv("../../.env")

# Initialize HuggingFace embeddings
def initialize_embeddings():
    model_name = "sentence-transformers/all-mpnet-base-v2"
    model_kwargs = {'device': 'mps'}
    encode_kwargs = {'normalize_embeddings': True}

    return HuggingFaceEmbeddings(
        model_name=model_name,
        model_kwargs=model_kwargs,
        encode_kwargs=encode_kwargs
    )

# Parse records to create entities and relationships
def parse_record(record):
    try:
        parsed_data = json.loads(record["response"])
        nodes = parsed_data["nodes"]
        edges = parsed_data["edges"]

        entity_mapping = {
            node["id"]: Entity(label=node["type"], name=node["id"])
            for node in nodes
        }

        entities = list(entity_mapping.values())
        relationships = [
            Relationship(
                startEntity=entity_mapping[edge["from"]],
                endEntity=entity_mapping[edge["to"]],
                name=edge["label"]
            )
            for edge in edges
        ]
        return entities, relationships
    except Exception as e:
        print(f"Error processing record: {e}")
        return [], []

# Load and process data from file
def load_knowledge_graphs(file_path):
    with open(file_path, "r") as file:
        data = json.load(file)
        return [
            KnowledgeGraph(entities=entities, relationships=relationships)
            for entities, relationships in map(parse_record, data)
        ]

# Embed entities and relationships
def embed_knowledge_graph(kg, hf):
    kg.embed_entities(
        embeddings_function=lambda x: np.array(hf.embed_documents(x)),
        entity_label_weight=0.3,
        entity_name_weight=0.7
    )
    kg.embed_relationships(
        embeddings_function=lambda x: np.array(hf.embed_documents(x))
    )
    return kg

# Merge knowledge graphs
def merge_knowledge_graphs(graphs):
    matcher = Matcher()
    combined_kg = graphs[0]

    for next_kg in graphs[1:]:
        combined_entities, combined_relationships = matcher.match_entities_and_update_relationships(
            entities1=combined_kg.entities,
            entities2=next_kg.entities,
            relationships1=combined_kg.relationships,
            relationships2=next_kg.relationships,
            rel_threshold=0.95,
            ent_threshold=0.95
        )
        combined_kg = KnowledgeGraph(entities=combined_entities, relationships=combined_relationships)

    return combined_kg

# Remove embeddings to allow saving of JSON
def remove_embeddings(kg):
    def clear_embeddings(obj):
        if hasattr(obj.properties, 'embeddings'):
            del obj.properties.embeddings
        return obj
    
    def clear_entity_embeddings(relationship):
        if hasattr(relationship, 'startEntity'):
            clear_embeddings(relationship.startEntity)
        if hasattr(relationship, 'endEntity'):
            clear_embeddings(relationship.endEntity)
        return relationship

    kg.entities = list(map(clear_embeddings, kg.entities))
    kg.relationships = list(map(clear_embeddings, kg.relationships))
    # Clear nested entities embeddings
    kg.relationships = list(map(clear_entity_embeddings, kg.relationships))
    return kg

# Convert KnowledgeGraph to JSON
def serialize_knowledge_graph(kg):
    return {
        "entities": [entity.model_dump() for entity in kg.entities],
        "relationships": [relationship.model_dump() for relationship in kg.relationships]
    }

# Save JSON to file
def save_to_file(data, file_path):
    with open(file_path, "w") as file:
        file.write(json.dumps(data, indent=4))

# Run the pipeline
if __name__ == "__main__":
    hf = initialize_embeddings()
 
    file_path = "../../data/kg_data/kg_outputs_sample.json"
    knowledge_graphs = load_knowledge_graphs(file_path)
    
    # Embed all the entities and relationships in each knowledge graph
    knowledge_graphs = list(map(lambda kg: embed_knowledge_graph(kg, hf), knowledge_graphs))
    
    # Perform the incremental graph merging process
    combined_kg = merge_knowledge_graphs(knowledge_graphs)

    # Prepare combined knowledge graph output
    combined_kg = remove_embeddings(combined_kg)

    combined_kg_json = serialize_knowledge_graph(combined_kg)

    output_file_path = "../../data/kg_data/combined_kg.json"
    save_to_file(combined_kg_json, output_file_path)