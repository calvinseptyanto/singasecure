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
SAMBANOVA_API_KEY = 
NEO4J_URI = 
NEO4J_USERNAME = 
NEO4J_PASSWORD = 
MAX_ASYNC=4
MAX_TOKENS=16384
```
