import time
from itext2kg.utils import Matcher
from itext2kg.models import Entity, Relationship, KnowledgeGraph
from itext2kg.graph_integration import GraphIntegrator
from langchain_huggingface import HuggingFaceEmbeddings
import json
import numpy as np
from dotenv import load_dotenv
import os

load_dotenv("../../.env")

model_name = "sentence-transformers/all-mpnet-base-v2"
model_kwargs = {'device': 'mps'}
encode_kwargs = {'normalize_embeddings': True}

hf = HuggingFaceEmbeddings(
    model_name=model_name,
    model_kwargs=model_kwargs,
    encode_kwargs=encode_kwargs
)

file_path = "../../data/kg_data/kg_outputs_500.json"

# Initialize lists to hold grouped entities and relationships
entities_records = []
relationships_records = []

# Start timing the file processing
start_time = time.time()

with open(file_path, "r") as file:
    data = json.load(file)  # Parse JSON file content

    for record in data:
        try:
            parsed_data = json.loads(record["response"])
            nodes = parsed_data["nodes"]
            edges = parsed_data["edges"]

            # Create a mapping of Entity objects by their id
            entity_mapping = {
                node["id"]: Entity(label=node["type"], name=node["id"])
                for node in nodes
            }
            
            # Append entities to records
            entities_records.append(list(entity_mapping.values()))
            
            # Create Relationship objects using entity_mapping
            relationships_records.append([
                Relationship(
                    startEntity=entity_mapping[edge["from"]],  # Reference the startEntity
                    endEntity=entity_mapping[edge["to"]],      # Reference the endEntity
                    name=edge["label"]
                )
                for edge in edges
            ])
        except Exception as e:
            print(f"Error processing record: {e}")

end_time = time.time()
print(f"File processing took {end_time - start_time:.2f} seconds.")

# Create KnowledgeGraphs
start_time = time.time()
knowledge_graphs = [
    KnowledgeGraph(entities=entities, relationships=relationships)
    for entities, relationships in zip(entities_records, relationships_records)
]
print(f"KnowledgeGraph creation took {time.time() - start_time:.2f} seconds.")

# Embedding entities and relationships
start_time = time.time()
[kg.embed_entities(
    embeddings_function=lambda x: np.array(hf.embed_documents(x)),
    entity_label_weight=0.3,
    entity_name_weight=0.7
) for kg in knowledge_graphs]
print(f"Entity embedding took {time.time() - start_time:.2f} seconds.")

start_time = time.time()
[kg.embed_relationships(
    embeddings_function=lambda x: np.array(hf.embed_documents(x))
) for kg in knowledge_graphs]
print(f"Relationship embedding took {time.time() - start_time:.2f} seconds.")

# Initialize the Matcher
matcher = Matcher()

# Start from first KG
combined_kg = knowledge_graphs[0]

# Incrementally merge the rest of the graphs
start_time = time.time()
for idx, next_kg in enumerate(knowledge_graphs[1:], start=1):
    print(f"Merging KnowledgeGraph {idx + 1} into the combined graph...")
    
    # Match and merge entities and relationships
    combined_entities, combined_relationships = matcher.match_entities_and_update_relationships(
        entities1=combined_kg.entities,
        entities2=next_kg.entities,
        relationships1=combined_kg.relationships,
        relationships2=next_kg.relationships,
        rel_threshold=0.90,  # Adjust threshold as needed
        ent_threshold=0.95   # Adjust threshold as needed
    )
    
    # Update the combined knowledge graph
    combined_kg = KnowledgeGraph(entities=combined_entities, relationships=combined_relationships)

print(f"Graph merging took {time.time() - start_time:.2f} seconds.")

# Visualize the combined KnowledgeGraph
start_time = time.time()
GraphIntegrator(uri=os.environ.get("URI"), username=os.environ.get("USERNAME"), password=os.environ.get("PASSWORD")).visualize_graph(knowledge_graph=combined_kg)
print(f"Graph visualization took {time.time() - start_time:.2f} seconds.")