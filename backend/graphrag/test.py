from backend.graphrag.ollama_service import rag, QueryParam
import requests
import pandas as pd

# rag.query_with_separate_keyword_extraction(
#     query="Explain the law of gravity",
#     prompt="Provide a detailed explanation suitable for high school students studying physics.",
#     param=QueryParam(mode="hybrid")
# )
df = pd.read_csv("../../data/news.csv")
texts = df['Text'].tolist()

response = requests.post(
    "http://0.0.0.0:8020/insert",
    json={
        "texts":texts
    }
)