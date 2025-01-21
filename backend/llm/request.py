import requests

url = "http://localhost:5000/predict"
payload = {
    "text": "OpenAI develops advanced AI technologies like GPT models.",
    "n_predict": 50
}

response = requests.post(url, json=payload)
if response.status_code == 200:
    print("Response JSON:")
    print(response.json())
else:
    print(f"Error: {response.status_code}")
    print(response.text)
