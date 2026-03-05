import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from services.llm_client import create_groq_client, get_groq_model
from agents.retriever import ROUTER_SYSTEM_PROMPT

async def test_groq():
    print("Testing RAW Retriever Groq Call...")
    client = create_groq_client()
    try:
        response = await client.chat.completions.create(
            model=get_groq_model(),
            messages=[
                {"role": "system", "content": ROUTER_SYSTEM_PROMPT},
                {"role": "user", "content": "snapshot payload data"}
            ],
            temperature=0.1,
            max_tokens=600,
        )
        print("Success:")
        print(response.choices[0].message.content)
    except Exception as exc:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_groq())
