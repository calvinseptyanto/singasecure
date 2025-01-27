import os
import asyncio
from lightrag import LightRAG, QueryParam
from lightrag.llm.openai import openai_complete_if_cache, openai_embed
from lightrag.llm.ollama import ollama_embed
from lightrag.llm.hf import hf_embed
from transformers import AutoModel, AutoTokenizer
from dotenv import load_dotenv
from lightrag.utils import EmbeddingFunc
import numpy as np

WORKING_DIR = "./local_neo4jWorkDir"
print(f"WORKING_DIR: {WORKING_DIR}")

if not os.path.exists(WORKING_DIR):
    os.mkdir(WORKING_DIR)

load_dotenv("../../.env")

async def llm_model_func(
    prompt, system_prompt=None, history_messages=[], keyword_extraction=False, **kwargs
) -> str:
    return await openai_complete_if_cache(
        "Meta-Llama-3.1-8B-Instruct",
        prompt,
        system_prompt=system_prompt,
        history_messages=history_messages,
        api_key=os.getenv("SAMBANOVA_API_KEY"),
        base_url="https://api.sambanova.ai/v1",
        **kwargs,
    )

async def main():
    try:
        rag = LightRAG(
            working_dir=WORKING_DIR,
            graph_storage="Neo4JStorage",
            llm_model_func=llm_model_func,
            embedding_func=EmbeddingFunc(
                embedding_dim=768,
                max_token_size=8192,
                func=lambda texts: hf_embed(
                    texts,
                    tokenizer=AutoTokenizer.from_pretrained("sentence-transformers/all-mpnet-base-v2"),
                    embed_model=AutoModel.from_pretrained("sentence-transformers/all-mpnet-base-v2")
                )
            ),
            # log_level="DEBUG"  #<-----------override log_level default
        )
        
        await rag.ainsert(["The issue at the heart of this case is whether, under current Board law, [Starbucks] was entitled to explicitly reward employees' for not participating in union activity, 'while falsely telling its workers that the federal labor law forced it to take this action,” wrote administrative law judge Mara-Louise Anzalone. “It was not.",
                           """
                           The Cyberspace Administration of China (CAC) said in a statement that the firm had breached the country's cybersecurity law, data security law, and personal information protection law.
'The facts of violations of laws and regulations are clear, the evidence is conclusive, the circumstances are serious, and the nature is vile,” the statement added.""",
"""of laws and regulations are clear, the evidence is conclusive, the circumstances are serious, and the nature is vile,” the statement added."""])

        # Perform naive search
        # print(
        #     await rag.aquery(
        #         "What are the top themes in this story?", param=QueryParam(mode="naive")
        #     )
        # )

        # # Perform local search
        # print(
        #     await rag.aquery(
        #         "What are the top themes in this story?", param=QueryParam(mode="local")
        #     )
        # )

        # # Perform global search
        # print(
        #     await rag.aquery(
        #         "What are the top themes in this story?",
        #         param=QueryParam(mode="global"),
        #     )
        # )

        # Perform hybrid search
        print(
            await rag.aquery(
                "What happened to starbucks?",
                param=QueryParam(mode="hybrid"),
            )
        )
    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    asyncio.run(main())
