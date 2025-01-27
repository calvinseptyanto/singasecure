from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import os
from lightrag import LightRAG, QueryParam
from lightrag.llm.hf import hf_embed
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

# Define models for request and response schemas
class Document(BaseModel):
    content: List[str]

class QueryRequest(BaseModel):
    query: str
    mode: str = "hybrid"  # Can be "naive", "local", "global", or "hybrid"

# Initialize LightRAG instance
rag = LightRAG(
    working_dir=WORKING_DIR,
    graph_storage="Neo4JStorage",
    llm_model_func=lambda prompt, **kwargs: openai_complete_if_cache(
        "Meta-Llama-3.1-8B-Instruct",
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

@app.post("/add-documents")
async def add_documents(doc: Document):
    """Add documents to the backend."""
    try:
        await rag.ainsert(doc.content)
        return {"message": "Documents added successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def query_documents(query_request: QueryRequest):
    """Query the backend using the specified mode."""
    try:
        result = await rag.aquery(
            query_request.query, param=QueryParam(mode=query_request.mode)
        )
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/diagnostics")
async def get_diagnostics():
    """Retrieve diagnostics for the LightRAG backend."""
    try:
        return {
            "working_dir": WORKING_DIR,
            "graph_storage": "Neo4JStorage",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents")
async def list_documents():
    """List documents in the backend (if supported)."""
    try:
        # Assuming `rag` supports listing documents
        documents = await rag.list_documents()  # Replace with actual method if needed
        return {"documents": documents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8020)