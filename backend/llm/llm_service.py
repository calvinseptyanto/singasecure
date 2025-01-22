from fastapi import File, FastAPI, HTTPException, UploadFile
from pydantic import BaseModel
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import uvicorn
import requests

# Initialize the model, tokenizer, and pipeline
torch.random.manual_seed(0)
model = AutoModelForCausalLM.from_pretrained(
    "EmergentMethods/Phi-3-mini-4k-instruct-graph",
    device_map="mps",
    torch_dtype=torch.float16,
    trust_remote_code=True,
)

tokenizer = AutoTokenizer.from_pretrained("EmergentMethods/Phi-3-mini-4k-instruct-graph")

pipe = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
)

# Generation arguments
generation_args = {
    "max_new_tokens": 500,
    "return_full_text": False,
    "do_sample": False,
}

# Define the FastAPI app
app = FastAPI()

# Define the request body model
class PromptRequest(BaseModel):
    prompt: str

@app.post("/generate_kg")
async def generate_kg(request: PromptRequest):
    try:
        messages = [
            {"role": "system", "content": """
A chat between a curious user and an artificial intelligence Assistant. The Assistant is an expert at identifying entities and relationships in text. The Assistant responds in JSON output only.

The User provides text in the format:

-------Text begin-------
<User provided text>
-------Text end-------

The Assistant follows the following steps before replying to the User:

1. **identify the most important entities** The Assistant identifies the most important entities in the text. These entities are listed in the JSON output under the key \"nodes\", they follow the structure of a list of dictionaries where each dict is:

\"nodes\":[{"id": <entity N>, "type": <type>, "detailed_type": <detailed type>}, ...]

where \"type\": <type> is a broad categorization of the entity. \"detailed type\": <detailed_type>  is a very descriptive categorization of the entity.

2. **determine relationships** The Assistant uses the text between -------Text begin------- and -------Text end------- to determine the relationships between the entities identified in the \"nodes\" list defined above. These relationships are called \"edges\" and they follow the structure of:

\"edges\":[{"from": <entity 1>, "to": <entity 2>, "label": <relationship>}, ...]

The <entity N> must correspond to the \"id\" of an entity in the \"nodes\" list.

The Assistant never repeats the same node twice. The Assistant never repeats the same edge twice.
The Assistant responds to the User in JSON only, according to the following JSON schema:

{"type":"object","properties":{"nodes":{"type":"array","items":{"type":"object","properties":{"id":{"type":"string"},"type":{"type":"string"},"detailed_type":{"type":"string"}},"required":["id","type","detailed_type"],"additionalProperties":false}},"edges":{"type":"array","items":{"type":"object","properties":{"from":{"type":"string"},"to":{"type":"string"},"label":{"type":"string"}},"required":["from","to","label"],"additionalProperties":false}}},"required":["nodes","edges"],"additionalProperties":false}
     """},
            {"role": "user", "content": f"""
-------Text begin-------
{request.prompt}
-------Text end-------
"""},
        ]

        output = pipe(messages, **generation_args)
        return {"response": output[0]['generated_text']}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
        Provide the number of the source document when relevant.
        If the answer cannot be deduced from the context, do not give an answer.""",
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

        output = pipe(messages, **generation_args)
        return {"response": output[0]['generated_text']}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
