import requests
from config import OPENAI_API_KEY
from utils.file_utils import save_image


def generate_image(project_id: str, prompt: str, provider: str = "dalle") -> dict:
    """Generate image using DALL-E or SDXL."""
    if provider == "dalle":
        return generate_dalle_image(project_id, prompt)
    elif provider == "sdxl":
        return generate_sdxl_image(project_id, prompt)
    else:
        raise ValueError(f"Unknown image provider: {provider}")


def generate_dalle_image(project_id: str, prompt: str) -> dict:
    """Generate image using DALL-E 3."""
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY not configured")
    
    url = "https://api.openai.com/v1/images/generations"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "model": "dall-e-3",
        "prompt": prompt,
        "n": 1,
        "size": "1024x1024",
    }
    
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    
    data = response.json()
    image_url = data["data"][0]["url"]
    
    # Download and save image
    image_path = save_image(project_id, image_url)
    
    return {
        "image": image_path,
        "url": image_url,
    }


def generate_sdxl_image(project_id: str, prompt: str) -> dict:
    """Generate image using Stable Diffusion XL (via Replicate or similar)."""
    # This is a placeholder - you'll need to implement SDXL API integration
    # For example, using Replicate API:
    # import replicate
    # output = replicate.run("stability-ai/sdxl:...", input={"prompt": prompt})
    # image_path = save_image(project_id, output[0])
    # return {"image": image_path, "url": output[0]}
    
    raise NotImplementedError("SDXL integration not yet implemented")

