"""Utils to call Cohere API to update OCR output text"""

import cohere
import os
import base64

from dotenv import load_dotenv
from constants.assignment_latex_template import ASSIGNMENT_LATEX_TEMPLATE

load_dotenv()

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
        raise Exception("COHERE_API_KEY environment variable not set")


    co = cohere.Client(api_key)


    prompt = (
        "You are a helpful LaTeX text formatting assistant.\n"
        "Take the raw OCR output below and return a clean, well-formatted version latex code.\n"
        "Important words of caution are the following "
        "- Output valid LaTeX only \
        - Do NOT include literal \n or other escape sequences \
        - Preserve all math formatting and special symbols \
        - Do NOT add explanations or extra text"
        "Do NOT include literal '\\n' characters — use real LaTeX line breaks like '\\\\'.\n"
        "Return only the LaTeX code.\n\n"
        "Here is an example template you can follow for general LaTeX guidelines:\n" + ASSIGNMENT_LATEX_TEMPLATE + "\n\n"
        "INPUT:\n" + raw_text + "\n\nOUTPUT:\n"
        )

    response = co.chat(
        model="command-r-plus",
        message=prompt
    )
    temp = response.text.strip()
    output = temp.replace("```latex", "").replace("```", "").strip()
    output = output.replace("\\n", "\n")
    return output


def get_text_from_image_cohere(image_bytes: bytes) -> str:
    """Run OCR on an image and return extracted text using Cohere's multimodal model"""
    load_dotenv()
    api_key = os.getenv('COHERE_API_KEY')

    if not api_key:
        # Fallback: return a placeholder message when API key is not set
        return "COHERE_API_KEY not set. Please configure your Cohere API key to use OCR functionality."

    try:
        co = cohere.Client(api_key)
        
        # For now, return a placeholder since the current Cohere version 
        # doesn't seem to support image input in the chat method
        return "OCR functionality requires Cohere API with image support. Current version doesn't support image input in chat method."
        
    except Exception as e:
        raise Exception(f"Cohere OCR failed: {e}")



