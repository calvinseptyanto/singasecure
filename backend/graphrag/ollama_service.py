from fastapi import FastAPI, HTTPException, File, UploadFile
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import List
import os
from lightrag import LightRAG, QueryParam
from lightrag.llm.ollama import ollama_embed, ollama_model_complete
from lightrag.utils import EmbeddingFunc
from langchain_huggingface import HuggingFaceEmbeddings
from typing import Optional
import asyncio
import nest_asyncio
import aiofiles

# Apply nest_asyncio to solve event loop issues
nest_asyncio.apply()

DEFAULT_RAG_DIR = "index_default"
app = FastAPI(title="LightRAG API", description="API for RAG operations")

DEFAULT_INPUT_FILE = "book.txt"
INPUT_FILE = os.environ.get("INPUT_FILE", f"{DEFAULT_INPUT_FILE}")
print(f"INPUT_FILE: {INPUT_FILE}")

# Configure working directory
# WORKING_DIR = os.environ.get("RAG_DIR", f"{DEFAULT_RAG_DIR}")
WORKING_DIR = "./local_neo4jWorkDir"
print(f"WORKING_DIR: {WORKING_DIR}")

if not os.path.exists(WORKING_DIR):
    os.mkdir(WORKING_DIR)

load_dotenv("../../.env")

rag = LightRAG(
    working_dir=WORKING_DIR,
    graph_storage="Neo4JStorage",
    llm_model_func=ollama_model_complete,
    llm_model_name="deepseek-r1:8b",
    llm_model_max_async=4,
    llm_model_max_token_size=8192,
    llm_model_kwargs={"host": "http://192.168.1.11:11434/", "options": {"num_ctx": 8192}},
    embedding_func=EmbeddingFunc(
        embedding_dim=768,
        max_token_size=8192,
        func=lambda texts: ollama_embed(
            texts, embed_model="nomic-embed-text", host="http://localhost:11434"
        ),
    ),
)

# Data models
class QueryRequest(BaseModel):
    query: str
    mode: str = "hybrid"
    only_need_context: bool = False

class InsertRequest(BaseModel):
    texts: List[str]  # Update this to handle a list of texts

class Response(BaseModel):
    status: str
    data: Optional[str] = None
    message: Optional[str] = None

# API routes
@app.post("/query", response_model=Response)
async def query_endpoint(request: QueryRequest):
    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: rag.query(
                request.query,
                param=QueryParam(
                    mode=request.mode, only_need_context=request.only_need_context
                ),
            ),
        )
        return Response(status="success", data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/insert", response_model=Response)
async def insert_endpoint(request: InsertRequest):
    try:
        # Use asyncio.gather for concurrent insertion
        await asyncio.gather(*(asyncio.to_thread(rag.insert, text) for text in request.texts))
        return Response(status="success", message="All texts inserted successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# insert by file in payload
@app.post("/insert_file", response_model=Response)
async def insert_file(file: UploadFile = File(...)):
    try:
        file_content = await file.read()
        # Read file content
        try:
            content = file_content.decode("utf-8")
        except UnicodeDecodeError:
            # If UTF-8 decoding fails, try other encodings
            content = file_content.decode("gbk")
        # Insert file content
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: rag.insert(content))

        return Response(
            status="success",
            message=f"File content from {file.filename} inserted successfully",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# insert by local default file
@app.post("/insert_default_file", response_model=Response)
@app.get("/insert_default_file", response_model=Response)
async def insert_default_file():
    try:
        # Read file content from book.txt
        async with aiofiles.open(INPUT_FILE, "r", encoding="utf-8") as file:
            content = await file.read()
        print(f"read input file {INPUT_FILE} successfully")
        # Insert file content
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: rag.insert(content))

        return Response(
            status="success",
            message=f"File content from {INPUT_FILE} inserted successfully",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8020)

# curl -X POST "http://localhost:8020/query" -H "Content-Type: application/json" -d '{"query": "your query here", "mode": "hybrid"}'