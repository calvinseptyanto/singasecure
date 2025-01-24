import requests
import pandas as pd

db_service = "http://localhost:8001/"

response = requests.post(
    db_service + "create-collection",
    json={
        "collection_name": "main",
        "vector_size": 768,
        "distance": "COSINE"
    },
)

print("Response:", response.status_code, response.text)

# Step 2: Add Documents to DB
df = pd.read_csv("../data/news.csv")
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

print("Response:", response.status_code, response.text)