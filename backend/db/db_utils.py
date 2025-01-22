from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain_core.documents import Document
from qdrant_client.models import Distance, VectorParams
from qdrant_client import QdrantClient
from uuid import uuid4

client = QdrantClient(host="localhost", port=6333)

model_name = "sentence-transformers/all-mpnet-base-v2"
model_kwargs = {'device': 'cpu'}
encode_kwargs = {'normalize_embeddings': False}

hf = HuggingFaceEmbeddings(
    model_name=model_name,
    model_kwargs=model_kwargs,
    encode_kwargs=encode_kwargs
)

if client.collection_exists("initialisation"):
    client.delete_collection("initialisation")

client.create_collection(
    collection_name="initialisation",
    vectors_config=VectorParams(size=768, distance=Distance.COSINE),
)

vector_store = QdrantVectorStore(
    client=client,
    collection_name="initialisation",
    embedding=hf,
)

# document_1 = Document(page_content="Donald Trump is woked", metadata={"article_name": "Donald Trump"})
# document_2 = Document(page_content="Barron Trump rizz", metadata={"article_name": "Barron Trump"})
# documents = [document_1, document_2, document_3]

def create_documents(page_content: list, metadata: list[dict]) -> Document:
    results = []
    for i in range(len(page_content)):
        # Create individual document
        results.append(Document(page_content=page_content[i], metadata=metadata[i]))
    return results
    
def create_collection(collection_name: str, vector_size: int, distance: str = "COSINE"):
    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=vector_size, distance=Distance[distance]),
    )

def add_documents(collection_name: str, documents: list[Document]):
    vector_store = QdrantVectorStore(
        client=client,
        collection_name=collection_name,
        embedding=hf,
    )
    ids = [str(uuid4()) for _ in documents]
    vector_store.add_documents(documents=documents, ids=ids)

def delete_document(collection_name: str, document_id: str):
    client.delete(collection_name=collection_name, points_selector={"ids": [document_id]})

def similarity_search(collection_name: str, question: str, k: int = 5):
    vector_store = QdrantVectorStore(
        client=client,
        collection_name=collection_name,
        embedding=hf,
    )

    return vector_store.similarity_search(query=question, k=k)
