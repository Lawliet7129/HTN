"""Utils to call Cohere API to update OCR output text"""

import cohere
import os

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
