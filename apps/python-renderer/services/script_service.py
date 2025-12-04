# This service is for reference - script generation is handled by the Next.js API
# But we can keep it here for potential future use or direct Python integration

import openai
from config import OPENAI_API_KEY


def generate_script(topic: str) -> str:
    """Generate video script using GPT-4."""
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY not configured")
    
    client = openai.OpenAI(api_key=OPENAI_API_KEY)
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": f"Generate a video script about: {topic}. Make it engaging and suitable for a 30-60 second video.",
            }
        ],
    )
    
    return response.choices[0].message.content

