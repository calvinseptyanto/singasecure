import requests
import pandas as pd
import time

db_service = "http://localhost:8020/"

# Step 2: Add Documents to DB
df = pd.read_csv("../data/news.csv")
documents = df["Text"].tolist()

# Split the documents into chunks of 1 document per request
# Since you can only send 20 requests per minute
batch_size = 1

for i in range(0, len(documents), batch_size):
    chunk = documents[i:i + batch_size]
    add_documents_payload = {
        "content": chunk
    }
    response = requests.post(
        db_service + "add-documents",
        json=add_documents_payload
    )
    
    print(f"Response for batch {i // batch_size + 1}: {response.status_code}, {response.text}")
    
    # Delay of 3 seconds to stay within 20 requests per minute
    if i + batch_size < len(documents):  # Skip delay after the last request
        time.sleep(1)