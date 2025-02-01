# smu-datathon
### Creating the virtual environment
```
cd server

# Create a virtual environment named 'venv'
python -m venv venv

# Activate the virtual environment (Windows)
venv\Scripts\activate

# Activate the virtual environment (MacOS/Linux)
source venv/bin/activate

# Installing requirements
pip install -r requirements.txt
```

### Setting up AuraDB
Create a free tier instance from
https://neo4j.com/product/auradb/

Take note of the URI, USERNAME, and PASSWORD.

### Generating a LLM API key from Sambanova
Generate a free key from 
https://cloud.sambanova.ai/pricing

### Creating a .env file in server/
```
cd server
```

```
SAMBANOVA_API_KEY = 
NEO4J_URI = 
NEO4J_USERNAME = 
NEO4J_PASSWORD =

MAX_ASYNC=4
MAX_TOKENS=16384
```

### Start the service
Launch the 2 services as stated below
```
cd server/backend/graphrag
python lightrag_service.py

cd server/backend
python intel.py
```

### Data Ingestion
After starting the services, you can run the data ingestion pipeline. WARNING: This will take very long due to the large amount of unstructured data to process.
```
cd server/backend
python ingest_request.py
```
