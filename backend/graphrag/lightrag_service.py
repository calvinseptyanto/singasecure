from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import os
from lightrag import LightRAG, QueryParam
from lightrag.llm.hf import hf_embed
from lightrag.llm.ollama import ollama_model_complete
from lightrag.llm.openai import openai_complete_if_cache
from lightrag.utils import EmbeddingFunc
from transformers import AutoModel, AutoTokenizer
from dotenv import load_dotenv

# Load environment variables
load_dotenv("../../.env")

WORKING_DIR = "./local_neo4jWorkDir"
if not os.path.exists(WORKING_DIR):
    os.mkdir(WORKING_DIR)

# Initialize FastAPI app
app = FastAPI()

rag = LightRAG(
    working_dir=WORKING_DIR,
    graph_storage="Neo4JStorage",
    llm_model_func=lambda prompt, **kwargs: openai_complete_if_cache(
        "Qwen2.5-72B-Instruct",
        prompt,
        api_key=os.getenv("SAMBANOVA_API_KEY"),
        base_url="https://api.sambanova.ai/v1",
        **kwargs,
    ),
    embedding_func=EmbeddingFunc(
        embedding_dim=768,
        max_token_size=8192,
        func=lambda texts: hf_embed(
            texts,
            tokenizer=AutoTokenizer.from_pretrained("sentence-transformers/all-mpnet-base-v2"),
            embed_model=AutoModel.from_pretrained("sentence-transformers/all-mpnet-base-v2"),
        ),
    ),
)

neo4jstorage = rag.chunk_entity_relation_graph

class Document(BaseModel):
    content: List[str]

@app.post("/add-documents")
async def add_documents(doc: Document):
    """Add documents to the backend."""
    try:
        await rag.ainsert(doc.content)
        return {"message": "Documents added successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
class QueryRequest(BaseModel):
    query: str
    mode: str = "hybrid"  # Can be "naive", "local", "global", or "hybrid"
    top_k : int = 20
    prompt : str = None

@app.post("/query")
async def query_documents(query_request: QueryRequest):
    """Query the backend using the specified mode."""
    try:
        if query_request.prompt:
            result = await rag.aquery(
                query = query_request.query, 
                prompt = query_request.prompt, 
                param=QueryParam(mode=query_request.mode, 
                                 top_k=30)
            )
        else:
            result = await rag.aquery(
                query = query_request.query, 
                param=QueryParam(mode=query_request.mode, 
                                 top_k=30)
            )
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/get-kg")
async def get_entire_kg():
    async with neo4jstorage._driver.session(database=neo4jstorage._DATABASE) as session:
        # Query to fetch filtered nodes
        nodes_query = """
        MATCH (n)
        RETURN labels(n) as label, n.entity_type as group
        LIMIT 1000
        """

        nodes = await session.run(nodes_query)
        nodes_list = [
            {
                "label": record["label"],
                "group": record["group"],
            }
            async for record in nodes
        ]

        # Query to fetch filtered edges
        edges_query = """
        MATCH (n)-[r]->(m)
        RETURN labels(n) AS from, labels(m) AS to, r.keywords AS label
        """

        edges = await session.run(edges_query)
        edges_list = [
            {
                "from": record["from"],
                "to": record["to"],
                "label": record["label"]
            }
            async for record in edges
        ]

    neo4jstorage._driver.close()

    # Combine nodes and edges into one dictionary
    graph_data = {
        "nodes": nodes_list,
        "edges": edges_list
    }

    return graph_data

class EdgeModel(BaseModel):
    node_from: str
    node_to: str

@app.post("/get-path")
async def get_path_between_edges(request: EdgeModel):
    async with neo4jstorage._driver.session(database=neo4jstorage._DATABASE) as session:
        edges_query = f"""
        MATCH (n:`{request.node_from}`)-[r]->(m:`{request.node_to}`)
        RETURN labels(n) AS from, labels(m) AS to, r.keywords AS label
        """

        edges = await session.run(edges_query)
        edges_list = [
            {
                "from": record["from"],
                "to": record["to"],
                "label": record["label"]
            }
            async for record in edges
        ]

    neo4jstorage._driver.close()

    # Combine nodes and edges into one dictionary
    graph_data = {
        "edges": edges_list
    }

    return graph_data

class SubGraphRequest(BaseModel):
    node_start: str
    depth : int = 1

@app.post("/sub-kg")
async def get_sub_graph(request: SubGraphRequest):
    async with neo4jstorage._driver.session(database=neo4jstorage._DATABASE) as session:
        # Dynamically construct the nodes query with the label and depth
        nodes_query = f"""
            MATCH (start:`{request.node_start}`)-[*0..{request.depth}]-(n)
            RETURN DISTINCT labels(n) AS labels, n.entity_type AS group
        """

        nodes = await session.run(nodes_query)
        nodes_list = [
            {
                "label": record["labels"][0],  # Assuming you want the first label
                "group": record["group"],
            }
            async for record in nodes
        ]

        # Dynamically construct the edges query with the label and depth
        edges_query = f"""
            MATCH (start:`{request.node_start}`)-[*0..{request.depth}]-(n)-[r]->(m)
            RETURN DISTINCT labels(n) AS from_labels, labels(m) AS to_labels, r.keywords AS label
        """

        edges = await session.run(edges_query)
        edges_list = [
            {
                "from": record["from_labels"][0],  # Assuming you want the first label
                "to": record["to_labels"][0],      # Assuming you want the first label
                "label": record["label"],
            }
            async for record in edges
        ]

        return {"nodes": nodes_list, "edges": edges_list}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8020)