"""Run OCR using Tesseract"""

import io
from PIL import Image
import pytesseract

def get_text_from_image(image_bytes: bytes) -> str:
    """Run OCR on an image and return extracted text using tesseract"""
    try:
        image = Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        raise Exception(f"Failed to load image: {e}")


    try:
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        raise Exception(f"Tesseract OCR failed: {e}")


