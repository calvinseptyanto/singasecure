import requests
import pandas as pd
import time

llm_service = "http://localhost:8000/"
db_service = "http://localhost:8001/"

def log_time(message):
    """Log the current time with a message."""
    current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    print(f"[{current_time}] {message}")

# Step 1: Test Create Collection
log_time("Starting: Create Collection")
start_time = time.time()

response = requests.post(
    db_service + "create-collection",
    json={
        "collection_name": "main",
        "vector_size": 768,
        "distance": "COSINE"
    },
)

end_time = time.time()
log_time(f"Finished: Create Collection in {end_time - start_time:.2f} seconds")
print("Response:", response.status_code, response.text)

# Step 2: Add Documents to DB
log_time("Starting: Add Documents to DB")
start_time = time.time()

df = pd.read_csv("../data/news.csv").head(50)
documents = df.apply(
    lambda row: {
        "page_content": row["Text"],
        "metadata": {"source": row["Link"]}
    },
    axis=1
).tolist()

add_documents_payload = {
    "collection_name": "main",
    "documents": documents,
}

response = requests.post(
    db_service + "add-documents",
    json=add_documents_payload
)

end_time = time.time()
log_time(f"Finished: Add Documents to DB in {end_time - start_time:.2f} seconds")
print("Response:", response.status_code, response.text)

# Step 3: Test RAG
question = "What does TikTok do and what was their report on the news?"
chat_payload = {"question": question}

log_time("Starting: Test RAG")
start_time = time.time()

response = requests.post(
    llm_service + "chat",
    json=chat_payload
)

end_time = time.time()
log_time(f"Finished: Test RAG in {end_time - start_time:.2f} seconds")
print("Response:", response.status_code, response.json() if response.status_code == 200 else response.text)

# # Step 4: Delete Collection
# log_time("Starting: Delete Collection")
# start_time = time.time()

# response = requests.delete(
#     db_service + "delete-collection",
#     json={"collection_name": "main"}
# )

# end_time = time.time()
# log_time(f"Finished: Delete Collection in {end_time - start_time:.2f} seconds")
# print("Response:", response.status_code, response.text)
