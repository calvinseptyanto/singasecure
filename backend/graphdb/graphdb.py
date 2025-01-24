import json
from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

load_dotenv("../../.env")

URI = os.environ.get("URI")
USERNAME = os.environ.get("USERNAME")
PASSWORD = os.environ.get("PASSWORD")

class Neo4jHandler:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def create_nodes(self, nodes):
        with self.driver.session() as session:
            for node in nodes:
                session.execute_write(self._create_node, node)

    @staticmethod
    def _create_node(tx, node):
        query = f"""
        MERGE (n:{node['type']} {{id: $id, detailed_type: $detailed_type}})
        """
        tx.run(query, id=node['id'], detailed_type=node['detailed_type'])

    def create_relationships(self, edges):
        with self.driver.session() as session:
            for edge in edges:
                session.execute_write(self._create_relationship, edge)

    @staticmethod
    def _create_relationship(tx, edge):
        query = f"""
        MATCH (from {{id: $from_id}}), (to {{id: $to_id}})
        MERGE (from)-[:{edge['label'].replace(" ", "_").upper()}]->(to)
        """
        tx.run(query, from_id=edge['from'], to_id=edge['to'])

    def find_related_nodes(self, node_id):
        with self.driver.session() as session:
            result = session.execute_read(self._find_related, node_id)
            return result

    @staticmethod
    def _find_related(tx, node_id):
        query = """
        MATCH (n {id: $node_id})-[r]->(related)
        RETURN n.id AS node, type(r) AS relationship, related.id AS related_node
        """
        return list(tx.run(query, node_id=node_id))

def process_json_file(file_path, neo4j_handler):
    with open(file_path, "r") as file:
        data = json.load(file)  # Parse JSON file content

        for record in data:
            try: 
                parsed_data = json.loads(record["response"])
                nodes = parsed_data["nodes"]
                edges = parsed_data["edges"]

                # Add nodes and relationships to the database
                neo4j_handler.create_nodes(nodes)
                neo4j_handler.create_relationships(edges)
            except Exception as e:
                print("Unterminated string")

# Initialize Neo4jHandler
neo4j_handler = Neo4jHandler(
    URI, 
    USERNAME, 
    PASSWORD,
)

# Batch Create Entities and Relationships in Neo4j
process_json_file("../../data/kg_data/kg_outputs_500.json", neo4j_handler)

# Query Example
related_nodes = neo4j_handler.find_related_nodes("Starbucks")
for record in related_nodes:
    print(record)

# Close connection
neo4j_handler.close()
