"""Utils to call Cohere API to update OCR output text"""

import cohere
import os
import base64

from dotenv import load_dotenv
from backend.constants.assignment_latex_template import ASSIGNMENT_LATEX_TEMPLATE

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


    co = cohere.ClientV2(api_key)


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
        model="command-a-03-2025",
        messages=[{"role": "user", "content": prompt}]
    )
    temp = response.message.content[0].text.strip()
    output = temp.replace("```latex", "").replace("```", "").strip()
    output = output.replace("\\n", "\n")
    return output


def get_text_from_image_cohere(image_bytes: bytes) -> str:
    """Run OCR on an image and return extracted text using Cohere's multimodal model"""
    load_dotenv()
    api_key = os.getenv('COHERE_API_KEY')

    if not api_key:
        raise Exception("COHERE_API_KEY environment variable not set")

    co = cohere.ClientV2(api_key)

    try:
        # Convert image to base64 for Cohere input
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")
        image_data_uri = f"data:image/png;base64,{image_b64}"

        response = co.chat(
            model="command-a-vision-07-2025",   # multimodal OCR-capable model
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Extract all text from this image. "
                        "If there are any minor grammatical or structural mistakes in the inferred text, fix them. "
                        "Return ONLY the extracted text, do not add any extra commentary."},
                        {"type": "image", "image": image_data_uri},
                    ],
                }
            ],
        )

        # Cohere returns structured messages; grab the text
        if response.message and response.message.content:
            for c in response.message.content:
                if getattr(c, "type", None) == "text":
                    return getattr(c, "text", "").strip()

        raise Exception("Cohere OCR returned empty text.")

    except Exception as e:
        raise Exception(f"Cohere OCR failed: {e}")



