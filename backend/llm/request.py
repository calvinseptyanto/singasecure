import requests
import pandas as pd
import json

# Generating Knowledge Graph Endpoint
url = "http://localhost:8000/generate_kg"

# Reading the text files from
# df = pd.read_csv("../../data/news.csv").head(500)
df = pd.read_csv("../../data/news.csv")
values = df['Text'].values[500:]

all_outputs = []
counter = 1
for prompt in values:
    payload = {
        "prompt" : prompt
    }

    response = requests.post(url, json=payload)
    if response.status_code == 200:
        print(response.json())
        all_outputs.append(response.json())
    
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

    if counter % 100 == 0:
        output_filename = f"kg_outputs_{counter}.json"
        with open(output_filename, "w") as f:
            json.dump(all_outputs, f, indent=4)
    
    counter += 1

