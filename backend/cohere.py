"""Utils to call Cohere API to update OCR output text"""

import cohere
import os

def beautify_text(raw_text: str) -> str:
    """
    Send raw OCR text to Cohere and a beautified version
    The prompt asks the model to:
    - Normalize formatting
    - Fix spacing and line breaks
    - Improve readability without changing meaning
    - Return only the cleaned text
    """
    api_key = os.getenv('COHERE_API_KEY')

    if not api_key:
        # If no API key, return the raw text with basic cleaning
        print("Warning: COHERE_API_KEY not set, returning raw OCR text")
        return raw_text.strip()

    try:
        co = cohere.ClientV2(api_key)

        prompt = (
            "You are a helpful text formatting assistant.\n"
            "Take the raw OCR output below and return a clean, well-formatted version."
            "Do NOT add explanations — return only cleaned text. Preserve meaning.\n\n"
            "INPUT:\n" + raw_text + "\n\nOUTPUT:\n"
        )

        response = co.chat(
            model="command-a-03-2025", 
            messages=[{"role": "user", "content": prompt}]
        )

        return response.text
    except Exception as e:
        print(f"Cohere API error: {e}, returning raw OCR text")
        return raw_text.strip()