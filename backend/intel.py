from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from prompts import *
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv("../../.env")

# Initialize FastAPI app
app = FastAPI()

# Define models for request and response schemas
class TopicOverviewRequest(BaseModel):
    query: str

@app.post("/api/topic-overview")
async def topic_overview(request: TopicOverviewRequest):
    """Generate topic overview and related information."""
    try:
        # Custom prompt for structured and detailed responses
        prompt = TOPICS_PROMPT

        # Post request to LLM
        llm_api = "http://localhost:8020/execute-query"
        chat_payload = {"query": request.query, "prompt" : prompt}

        llm_response = requests.post(
            llm_api,
            json=chat_payload
        )

        return llm_response.json()["result"]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
class WhatIfRequest(BaseModel):
    query: str

@app.post("/api/whatif")
async def what_if_scenario(request: WhatIfRequest):
    """Generate analysis and insights for a 'what if' national security scenario."""
    try:
        prompt = WHAT_IF_PROMPT

        # Post request to LLM
        llm_api = "http://localhost:8020/execute-query"
        chat_payload = {"query": request.query, "prompt" : prompt}

        llm_response = requests.post(
            llm_api,
            json=chat_payload
        )

        return llm_response.json()["result"]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8021)