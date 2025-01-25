import requests
llama_service = "http://localhost:8002/"

# Step 3: Test RAG
question = "What does TikTok do and what was the latest report of them on the news?"
chat_payload = {"question": question}

response = requests.post(
    llama_service + "chat",
    json=chat_payload
)

print(response.text)