from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
import time
from ipex_llm.transformers import AutoModelForCausalLM
from transformers import AutoTokenizer
from prompt_template import create_prompt
import uvicorn

# Define constants and settings
MODEL_PATH = "EmergentMethods/Phi-3-mini-4k-instruct-graph"

# Initialize FastAPI app
app = FastAPI()

# Load the model and tokenizer
print("Loading model...")
model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    load_in_4bit=True,
    trust_remote_code=True,
    optimize_model=True,
    use_cache=True,
)

model = model.to('xpu')

generation_args = {
    "max_new_tokens": 500,
    "do_sample": False,
}

print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, trust_remote_code=True)


# Define request schema using Pydantic
class InferenceRequest(BaseModel):
    text: str


@app.post("/predict")
async def predict(request: InferenceRequest):
    try:
        # Extract user input
        user_text = request.text

        # Create the formatted prompt using the template
        prompt_template = create_prompt(user_text)
        formatted_prompt = prompt_template[1]["content"]  # Extract the formatted user prompt

        # Tokenize the formatted prompt
        input_ids = tokenizer.encode(formatted_prompt, return_tensors="pt").to('xpu')

        # Perform inference
        start_time = time.time()
        output = model.generate(input_ids, **generation_args)
        torch.xpu.synchronize()
        end_time = time.time()

        # Decode the output
        output_str = tokenizer.decode(output[0], skip_special_tokens=False)

        # Return the result as JSON
        return {
            "user_input": user_text,
            "formatted_prompt": formatted_prompt,
            "output": output_str,
            "inference_time": end_time - start_time,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Run the app using Uvicorn
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
