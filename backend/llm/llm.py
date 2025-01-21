import torch
from ipex_llm.transformers import AutoModelForCausalLM
from transformers import AutoTokenizer, pipeline 
from prompt_template import create_prompt

print(torch.xpu.is_available())

# Define constants and settings
MODEL_PATH = "EmergentMethods/Phi-3-mini-4k-instruct-graph"

# Load the model and tokenizer
print("Loading model...")
try:
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_PATH,
        load_in_4bit=True,
        trust_remote_code=True,
        optimize_model=True,
        use_cache=True,
    )
    model = model.to('xpu')
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")

generation_args = { 
    "max_new_tokens": 500, 
    "return_full_text": False, 
    "temperature": 0.0, 
    "do_sample": False, 
}

print("Loading tokenizer...")
try:
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, trust_remote_code=True)
    print("Tokenizer loaded successfully!")
except Exception as e:
    print(f"Error loading tokenizer: {e}")
    
# Test the generation process
user_text = "OpenAI develops advanced AI technologies like GPT models."

with torch.inference_mode():
    # Create the formatted prompt using the template
    print("Creating prompt...")
    prompt = create_prompt(user_text)

    input_ids = tokenizer.encode(prompt, return_tensors="pt").to('xpu')

    # Perform inference
    print("Generating output...")

    output = model.generate(input_ids,
                            do_sample=False,
                            max_new_tokens=100)

    # Decode the output
    output_str = tokenizer.decode(output[0], skip_special_tokens=False)

    # Print results
    print(f"User Input: {user_text}")
    print(f"Output: {output_str}")