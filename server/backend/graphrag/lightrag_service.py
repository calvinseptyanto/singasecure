from fastapi import FastAPI, HTTPException
from dataclasses import asdict
from pydantic import BaseModel
from typing import List, Optional
import os
from lightrag import LightRAG, QueryParam
from lightrag.llm.hf import hf_embed
from lightrag.llm.openai import openai_complete_if_cache
from lightrag.operate import extract_keywords_only
from lightrag.utils import EmbeddingFunc
from transformers import AutoModel, AutoTokenizer
from dotenv import load_dotenv

# Load environment variables
load_dotenv("../../.env")

# Set up a working directory
WORKING_DIR = "./local_neo4jWorkDir"
if not os.path.exists(WORKING_DIR):
    os.mkdir(WORKING_DIR)

# Initialize FastAPI app
app = FastAPI()

# Initialize the RAG engine
rag_engine = LightRAG(
    working_dir=WORKING_DIR,
    graph_storage="Neo4JStorage",
    llm_model_func=lambda prompt, **kwargs: openai_complete_if_cache(
        "Meta-Llama-3.3-70B-Instruct",
        prompt,
        api_key=os.getenv("SAMBANOVA_API_KEY"),
        base_url="https://api.sambanova.ai/v1",
        **kwargs,
    ),
    embedding_func=EmbeddingFunc(
        embedding_dim=768,
        max_token_size=8192,
        func=lambda texts: hf_embed(
            texts,
            tokenizer=AutoTokenizer.from_pretrained("sentence-transformers/all-mpnet-base-v2"),
            embed_model=AutoModel.from_pretrained("sentence-transformers/all-mpnet-base-v2"),
        ),
    ),
)

neo4j_storage = rag_engine.chunk_entity_relation_graph


# ---------------------
#  Pydantic Models
# ---------------------
class DocumentPayload(BaseModel):
    content: List[str]


class QueryPayload(BaseModel):
    query: str
    mode: str = "hybrid"  # Could be "naive", "local", "global", or "hybrid"
    top_k: int = 15
    prompt: Optional[str] = None


class EntityFilterPayload(BaseModel):
    query: str
    mode: str = "hybrid"
    top_k: int = 15


class KGNodesPayload(BaseModel):
    node_labels: Optional[List[str]] = None  # Optional filter for node labels


class PathNodesPayload(BaseModel):
    node_from: str
    node_to: str


class SubGraphPayload(BaseModel):
    node_start: str
    depth: int = 1  # 0 refers to neighbor nodes, 1 refers to neighbors of neighbors, etc.


# ---------------------
#  Route Handlers
# ---------------------
@app.post("/upload-documents")
async def upload_documents(payload: DocumentPayload):
    """
    Upload documents to the knowledge graph.

    Args:
        payload (DocumentPayload): Contains a list of document contents to be inserted.

    Returns:
        dict: Success message indicating that documents were added.
    """
    try:
        await rag_engine.ainsert(payload.content)
        return {"message": "Documents added successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/execute-query")
async def execute_query(payload: QueryPayload):
    """
    Execute a query against the knowledge graph using a specified mode (e.g., naive, local, global, hybrid).

    Args:
        payload (QueryPayload):
            - query (str): The query text.
            - mode (str): The query mode. Defaults to 'hybrid'.
            - top_k (int): Number of top results to retrieve. Defaults to 15.
            - prompt (str): Optional prompt to guide the query.

    Returns:
        dict: The result of the query operation.
    """
    try:
        if payload.prompt:
            result = await rag_engine.aquery(
                query=payload.query,
                prompt=payload.prompt,
                param=QueryParam(mode=payload.mode, top_k=payload.top_k),
            )
        else:
            result = await rag_engine.aquery(
                query=payload.query,
                param=QueryParam(mode=payload.mode, top_k=payload.top_k),
            )
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/filter-knowledge-graph")
async def filter_knowledge_graph(payload: EntityFilterPayload):
    """
    Dynamically filter the knowledge graph based on extracted keywords from the provided query.

    Args:
        payload (EntityFilterPayload):
            - query (str): The user query from which to extract keywords.
            - mode (str): Query mode (e.g., naive, local, global, hybrid). Defaults to 'hybrid'.
            - top_k (int): Number of top results to consider. Defaults to 15.

    Returns:
        dict:
            - filtered_kg: The subgraph filtered by relevant entities.
            - entities: List of entity labels used in the filtering.
    """
    try:
        # Extract high-level (hl) and low-level (ll) keywords from the query
        hl_keywords, ll_keywords = await extract_keywords_only(
            text=payload.query,
            param=QueryParam(mode=payload.mode, top_k=payload.top_k),
            global_config=asdict(rag_engine),
            hashing_kv=rag_engine.llm_response_cache
        )

        # Combine keywords into a single string
        keywords_string = " ".join(set(hl_keywords + ll_keywords))

        # Retrieve similar entities from the knowledge graph
        results = await rag_engine.entities_vdb.query(keywords_string, top_k=payload.top_k)
        entity_labels = [entity["entity_name"].strip('"') for entity in results]

        if not entity_labels:
            return {"message": "No relevant entities found for filtering."}

        # Filter knowledge graph based on retrieved entity labels
        filtered_kg = await retrieve_entire_kg(KGNodesPayload(node_labels=entity_labels))

        return filtered_kg
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/get-path-between-nodes")
async def get_path_between_nodes(payload: PathNodesPayload):
    """
    Retrieve the path (or relationships) between two specific node labels in the graph.

    Args:
        payload (PathNodesPayload):
            - node_from (str): The label of the starting node.
            - node_to (str): The label of the ending node.

    Returns:
        dict:
            - edges: A list of edges that match the specified start and end node labels.
    """
    try:
        async with neo4j_storage._driver.session(database=neo4j_storage._DATABASE) as session:
            edges_query = f"""
            MATCH p = (n:`{payload.node_from}`)-[*]->(m:`{payload.node_to}`)
            RETURN
                [node IN nodes(p) | labels(node)] AS path_nodes,
                [node IN nodes(p) | node.description] AS node_descriptions,
                [rel IN relationships(p) | rel.keywords] AS path_labels,
                [rel IN relationships(p) | rel.description] AS relationship_descriptions
            """

            edges = await session.run(edges_query)
            edges_list = [
                {
                    "path_nodes": [node[0] for node in record["path_nodes"]],
                    "path_labels": record["path_labels"],
                }
                async for record in edges
            ]
        neo4j_storage._driver.close()

        return {
            "paths": edges_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/retrieve-subgraph")
async def retrieve_subgraph(payload: SubGraphPayload):
    """
    Retrieve a subgraph around a specified node label up to a certain depth.

    Args:
        payload (SubGraphPayload):
            - node_start (str): The label of the starting node.
            - depth (int): How many "hops" from the start node to include in the subgraph.

    Returns:
        dict:
            - nodes: A list of nodes (labels, group, description) in the subgraph.
            - edges: A list of edges (relationship details) in the subgraph.
    """
    try:
        async with neo4j_storage._driver.session(database=neo4j_storage._DATABASE) as session:
            # Query to fetch nodes within the specified depth
            nodes_query = f"""
                MATCH (start:`{payload.node_start}`)-[*0..{payload.depth}]-(n)
                RETURN DISTINCT
                    labels(n) AS labels,
                    n.entity_type AS group,
                    n.description AS description
            """
            nodes = await session.run(nodes_query)
            nodes_list = [
                {
                    "label": record["labels"][0],  # Taking the first label if multiple
                    "group": record["group"],
                    "description": record["description"],
                }
                async for record in nodes
            ]

            # Query to fetch edges within the specified depth
            edges_query = f"""
                MATCH (start:`{payload.node_start}`)-[*0..{payload.depth}]-(n)-[r]->(m)
                RETURN DISTINCT
                    labels(n) AS from_labels,
                    n.entity_type AS from_group,
                    n.description AS from_description,
                    labels(m) AS to_labels,
                    m.entity_type AS to_group,
                    m.description AS to_description,
                    r.keywords AS label,
                    r.description AS relationship_description
            """
            edges = await session.run(edges_query)
            edges_list = [
                {
                    "from_label": record["from_labels"][0],
                    "from_group": record["from_group"],  # Extracted from n.entity_type
                    "from_description": record["from_description"],
                    "to_label": record["to_labels"][0],
                    "to_group": record["to_group"],  # Extracted from m.entity_type
                    "to_description": record["to_description"],
                    "label": record["label"],
                    "relationship_description": record["relationship_description"],
                }
                async for record in edges
            ]

        return {"nodes": nodes_list, "edges": edges_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------
#  Helper Function
# ---------------------
async def retrieve_entire_kg(payload: KGNodesPayload):
    """
    Retrieve the entire knowledge graph or filter nodes and edges based on specified labels.

    Args:
        payload (KGNodesPayload):
            - node_labels (List[str], optional): A list of node labels to filter. If None, fetches all.

    Returns:
        dict:
            - nodes: A list of node information (labels, group, description).
            - edges: A list of edges with relationship keywords and descriptions.
    """
    async with neo4j_storage._driver.session(database=neo4j_storage._DATABASE) as session:
        if payload.node_labels:
            # Query to fetch filtered nodes
            nodes_query = """
            MATCH (n)
            WHERE ANY(label IN $labels WHERE label IN labels(n))
            RETURN
                labels(n) AS label,
                n.entity_type AS group,
                n.description AS description
            """

            # Query to fetch filtered edges with from_group and to_group
            edges_query = """
            MATCH (n)-[r]->(m)
            WHERE ANY(label IN $labels WHERE label IN labels(n))
               OR ANY(label IN $labels WHERE label IN labels(m))
            RETURN
                labels(n) AS from,
                n.entity_type AS from_group,
                n.description AS from_description,
                labels(m) AS to,
                m.entity_type AS to_group,
                m.description AS to_description,
                r.keywords AS label,
                r.description AS relationship_description
            """
            # Execute queries
            nodes = await session.run(nodes_query, labels=payload.node_labels)
            edges = await session.run(edges_query, labels=payload.node_labels)

        else:
            # Fetch all nodes
            nodes_query = """
            MATCH (n)
            RETURN
                labels(n) AS label,
                n.entity_type AS group,
                n.description AS description
            """
            # Fetch all edges with from_group and to_group
            edges_query = """
            MATCH (n)-[r]->(m)
            RETURN
                labels(n) AS from,
                n.entity_type AS from_group,
                n.description AS from_description,
                labels(m) AS to,
                m.entity_type AS to_group,
                m.description AS to_description,
                r.keywords AS label,
                r.description AS relationship_description
            """
            # Execute queries
            nodes = await session.run(nodes_query)
            edges = await session.run(edges_query)

        # Process query results for nodes
        nodes_list = [
            {
                "label": record["label"][0],
                "group": record["group"],
                "description": record["description"],
            }
            async for record in nodes
        ]

        # Process query results for edges
        edges_list = [
            {
                "from_label": record["from"],
                "from_group": record["from_group"],  # Extracted from n.entity_type
                "from_description": record["from_description"],
                "to_label": record["to"],
                "to_group": record["to_group"],  # Extracted from m.entity_type
                "to_description": record["to_description"],
                "label": record["label"],
                "relationship_description": record["relationship_description"],
            }
            async for record in edges
        ]

    # Close Neo4j connection
    neo4j_storage._driver.close()

    return {
        "nodes": nodes_list,
        "edges": edges_list
    }


# ---------------------
#  Main Entry Point
# ---------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8020)
