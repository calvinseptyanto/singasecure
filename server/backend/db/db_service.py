from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import uvicorn
from db_utils import *

app = FastAPI()

# Endpoints
class CreateCollectionModel(BaseModel):
    collection_name: str
    vector_size: int
    distance: str = "COSINE"

@app.post("/create-collection")
def create_collection_endpoint(data: CreateCollectionModel):
    try:
        create_collection(data.collection_name, data.vector_size, data.distance)
        return {"message": f"Collection '{data.collection_name}' created successfully."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class DocumentModel(BaseModel):
    page_content: str
    metadata: Dict

class AddDocumentsModel(BaseModel):
    collection_name: str
    documents: List[DocumentModel]

@app.post("/add-documents")
def add_documents_endpoint(data: AddDocumentsModel):
    try:
        documents = [
            Document(page_content=doc.page_content, metadata=doc.metadata)
            for doc in data.documents
        ]
        add_documents(data.collection_name, documents)
        return {"message": "Documents added successfully."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class DeleteDocumentModel(BaseModel):
    collection_name: str
    document_id: str

@app.delete("/delete-document")
def delete_document_endpoint(data: DeleteDocumentModel):
    try:
        delete_document(data.collection_name, data.document_id)
        return {"message": f"Document with ID '{data.document_id}' deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class DeleteCollectionModel(BaseModel):
    collection_name: str

@app.delete("/delete-collection")
def delete_collection_endpoint(data: DeleteCollectionModel):
    if client.collection_exists(data.collection_name):
        client.delete_collection(data.collection_name)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)