import pytest
from fastapi.testclient import TestClient
from db_service import app  # Import your FastAPI app from the main file

client = TestClient(app)

# Test for creating a collection
def test_create_collection():
    response = client.post(
        "/create-collection",
        json={
            "collection_name": "test_collection",
            "vector_size": 768,
            "distance": "COSINE"
        },
    )
    assert response.status_code == 200
    assert response.json() == {"message": "Collection 'test_collection' created successfully."}

# Test for adding documents
def test_add_documents():
    response = client.post(
        "/add-documents",
        json={
            "collection_name": "test_collection",
            "documents": [
                {"page_content": "Sample text about Donald Trump and his presidential elections", "metadata": {"title": "Sample"}},
                {"page_content": "Another text for sampling", "metadata": {"title": "Another"}},
            ],
        },
    )
    assert response.status_code == 200
    assert response.json() == {"message": "Documents added successfully."}

# Test for deleting a document
# def test_delete_document():
#     # Use a placeholder document ID for testing
#     response = client.delete(
#         "/delete-document",
#         json={
#             "collection_name": "test_collection",
#             "document_id": "test_document_id",
#         },
#     )
#     assert response.status_code == 200
#     assert response.json() == {"message": "Document with ID 'test_document_id' deleted successfully."}

# Test for similarity search
def test_similarity_search():
    response = client.post(
        "/similarity-search",
        json={
            "collection_name": "test_collection",
            "query": "Sample",
            "k": 5
        },
    )

    print(response)
    assert response.status_code == 200
    assert "query" in response.json()
    assert "results" in response.json()

def test_delete_collection():
    response = client.request(
        "DELETE",
        "/delete-collection",
        json={
            "collection_name": "test_collection",
            "vector_size": 768,
            "distance": "COSINE"
        }
    )
    assert response.status_code == 200
