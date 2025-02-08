# SingaSecure

SingaSecure is a smart solution designed to enhance Singapore's response to security threats. By transforming vast amounts of unstructured data into clear, actionable threat intelligence, SingaSecure empowers security agencies—such as Singapore's Internal Security Department (ISD)—and everyday citizens with reliable insights into evolving security risks and trends.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [Threat Overview](#threat-overview)
  - [Articles](#articles)
  - [KnowledgeGraph Visualization](#knowledgegraph-visualization)
  - [Pathway Finder](#pathway-finder)
  - [Node Exploration](#node-exploration)
  - [Key Insights for Threat Assessment](#key-insights-for-threat-assessment)
  - [What-if Analysis](#what-if-analysis)
- [Tools & Technologies Used](#tools--technologies-used)
- [Installation](#installation)
  - [Front-End Setup](#front-end-setup)
  - [Back-End Setup](#back-end-setup)
    - [Creating the Virtual Environment](#creating-the-virtual-environment)
    - [Setting up AuraDB](#setting-up-auradb)
    - [Generating a LLM API Key from Sambanova](#generating-a-llm-api-key-from-sambanova)
    - [Creating a .env File](#creating-a-env-file)
    - [Starting the Service](#starting-the-service)
    - [Data Ingestion](#data-ingestion)

---

## Overview

SingaSecure transforms overwhelming streams of unstructured data into clear guidance for detecting, understanding, and responding to security threats. Leveraging large language models (LLM), retrieval augmented generation (RAG), and knowledge graphs, the platform provides:
- **Comprehensive Threat Assessments:** Detailed analyses on how security topics might affect Singapore's national security.
- **Empowering Insights:** Easily accessible and understandable information for both security professionals and the general public.

---

## Features

### Threat Overview

- **Assessment and Analysis:**  
  Offers a clear evaluation of the searched security topic, detailing its potential impacts on Singapore's national security.
  
- **Threat Score:**  
  Assigns a severity score to each topic, allowing users to quickly gauge the level of risk and determine appropriate response strategies.

### Articles

- **Curated Content:**  
  Displays a curated list of articles that inform the threat overview, knowledge graph, and other insights.
  
- **Reliability Score:**  
  Each article is assessed by our machine learning model. Only those with a reliability score above 75% are automatically integrated into the system; others are flagged for review by ISD analysts through a Human-In-The-Loop process.

### KnowledgeGraph Visualization

- **Interactive View:**  
  Explore a dynamic knowledge graph displaying all relevant entities and their relationships.
  
- **Detailed Exploration:**  
  Click on nodes and edges to access detailed information and verify the data sources behind each connection.

### Pathway Finder

- **Connection Analysis:**  
  Identify and visualize the paths connecting two nodes within the knowledge graph.
  
- **Connection Summary:**  
  Each identified path comes with a summary that explains the underlying connection, revealing hidden links between entities.

### Node Exploration

- **Focused Analysis:**  
  Dive deep into any specific node to uncover detailed insights about its role and influence within the network.
  
- **Impact Mapping:**  
  Visualize how changes or threats to a particular node can affect surrounding entities and the broader system.

### Key Insights for Threat Assessment

- **Visibility:**  
  Highlights which parts of the security landscape are affected by a threat, pinpointing specific areas, entities, or networks.
  
- **Impact:**  
  Details the potential consequences for Singapore’s national security and daily life.
  
- **Prioritization:**  
  Ranks threats based on reliability, severity, and urgency, enabling decision-makers to prioritize remediation and mitigation strategies.

### What-if Analysis

- **Predictive and Prescriptive Insights:**  
  Simulate various scenarios to anticipate emerging risks and receive clear recommendations for mitigation.
  
- **Natural Language Search:**  
  Interact with the system using everyday language, making it accessible for both technical experts and non-experts.

---

## Tools & Technologies Used

- **Programming Languages:**  
  Python, JavaScript (React frontend)

- **Databases:**  
  Neo4j Aura (Graph DB), Nano Vector DB

- **Models:**  
  Meta Llama 3.1-8B / Meta Llama 3.3-70B, HuggingFace Embedding Models

- **Cloud & Deployment:**  
  Cloud-hosted Neo4j for scalability, OpenAI API for LLM interactions

- **Visualization:**  
  Neo4j AuraDB, vis-network library

- **Web-Search API:**  
  TavilyAPI

---

## Installation

### Front-End Setup

1. Navigate to the `client` directory:
    ```bash
    cd client
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Run the development server:
    ```bash
    npm run dev
    ```

---

### Back-End Setup

#### Creating the Virtual Environment

1. Navigate to the `server` directory:
    ```bash
    cd server
    ```
2. Create a virtual environment named `venv`:
    ```bash
    python -m venv venv
    ```
3. Activate the virtual environment:

   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```
   - **MacOS/Linux:**
     ```bash
     source venv/bin/activate
     ```
4. Install the required packages:
    ```bash
    pip install -r requirements.txt
    ```

#### Setting up AuraDB

- Create a free tier instance from [Neo4j AuraDB](https://neo4j.com/product/auradb/).
- Take note of the URI, USERNAME, and PASSWORD for your instance.

#### Generating a LLM API Key from Sambanova

- Generate a free key from [Sambanova Cloud Pricing](https://cloud.sambanova.ai/pricing).

#### Creating a .env File

1. Navigate to the `server` directory (if not already there):
    ```bash
    cd server
    ```
2. Create a `.env` file with the following content (fill in your keys and credentials):

    ```env
    SAMBANOVA_API_KEY=
    NEO4J_URI=
    NEO4J_USERNAME=
    NEO4J_PASSWORD=

    MAX_ASYNC=4
    MAX_TOKENS=16384
    ```

#### Starting the Service

Launch the two services as follows:

1. Start the graph service:
    ```bash
    cd server/backend/graphrag
    python lightrag_service.py
    ```
2. Start the intelligence service:
    ```bash
    cd server/backend
    python intel.py
    ```

### Architecture Diagrams
We used LightRAG as the main framework for Semantic RAG and Knowledge Graph Querying.

## Data Ingestion Pipeline
<img width="910" alt="image" src="https://github.com/user-attachments/assets/2f58c8f8-a30a-428f-accb-231bad9e7525" />

## Semantic RAG Pipeline
<img width="899" alt="image" src="https://github.com/user-attachments/assets/145eb3e9-793c-4ec0-a4bd-82b2e165c998" />

#### Data Ingestion

After starting the services, run the data ingestion pipeline. **WARNING:** This process may take a significant amount of time due to the large amount of unstructured data being processed.

1. From the `server/backend` directory, execute:
    ```bash
    python ingest_request.py
    ```

#### References
Guo, Z., Xia, L., Yu, Y., Ao, T., & Huang, C. (2024). LightRAG: Simple and fast retrieval-augmented generation. arXiv. https://arxiv.org/pdf/2410.05779

---
