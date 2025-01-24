import requests
import pandas as pd
import json

# Generating Knowledge Graph Endpoint
url = "http://localhost:8000/generate_kg"

df = pd.read_csv("../../data/news.csv")
sources = df["Link"].values
values = df['Text'].values

all_outputs = []
counter = 1

for prompt, source in zip(values, sources):
    payload = {
        "prompt": prompt
    }

    response = requests.post(url, json=payload)

    if response.status_code == 200:
        response_data = response.json()
        # Append the response with the source
        all_outputs.append({
            "source": source,
            "response": response_data['response']
        })
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

    # Checkpoint
    if counter % 50 == 0:
        output_filename = f"kg_outputs_{counter}.json"
        with open(output_filename, "w") as f:
            json.dump(all_outputs, f, indent=4)

    counter += 1

output_filename = f"kg_outputs_{counter}.json"
with open(output_filename, "w") as f:
    json.dump(all_outputs, f, indent=4)
