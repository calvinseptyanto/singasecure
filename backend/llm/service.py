import openai
import os
import requests
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

load_dotenv("../../.env", override=True)

client = openai.OpenAI(
    api_key=os.getenv("SAMBANOVA_API_KEY"),
    base_url="https://api.sambanova.ai/v1",
)

# client = openai.OpenAI(
#     api_key="ollama",
#     base_url="http://192.168.1.11:11434/v1",
# )

app = FastAPI()

class RAGRequest(BaseModel):
    question: str

@app.post("/chat")
async def chat(request: RAGRequest):
    try:
        question = request.question
        # Make a request to VectorDB to retrieve context
        url = "http://localhost:8001/retrieve-context"

        payload = {
            "collection_name" : "main",
            "question" : question,
            "k" : 5
        }

        response = requests.post(url, json=payload)

        # Append Context to Prompt
        retrieved_docs_text = response.json()['context']
    
        context = "\nExtracted documents:\n"
        context += "".join([f"Document {str(i)}:::\n" + doc for i, doc in enumerate(retrieved_docs_text)])

        messages = [
            {
                "role": "system",
                "content": """Using the information contained in the context,
        give a comprehensive answer to the question.
        Respond only to the question asked, response should be concise and relevant to the question.
        Provide the source document which is labelled after "Sourced Link/Name: " when relevant.
        If the answer cannot be deduced from the context, explain to the user that there is insufficient context to support
        the user's prompt.""",
            },
            {
                "role": "user",
                "content": f"""Context:
        {context}
        ---
        Now here is the question you need to answer.

        Question: {question}""",
            },
        ]

        response = client.chat.completions.create(
            model='Meta-Llama-3.1-8B-Instruct',
            messages=messages,
            temperature =  0.1,
            top_p = 0.1
        )

        # response = client.chat.completions.create(
        #     model='deepseek-r1:8b',
        #     messages=messages,
        #     temperature =  0.1,
        #     top_p = 0.1
        # )

        return {"response": response.choices[0].message.content}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)