"""FastAPI server exposing POST /convert-image"""

import os
import logging
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
import uvicorn

from .cohere import beautify_text, get_text_from_image_cohere

app = FastAPI(title="OCR + Beautify API")


# Allow the Three.js frontend on localhost:3000 and Vite dev server
origins = [
"http://localhost:3000",
"http://127.0.0.1:3000",
"http://localhost:3001",  # Vite dev server (alternative port)
"http://127.0.0.1:3001",
"http://localhost:5173",  # Vite dev server
"http://127.0.0.1:5173",
]


app.add_middleware(
CORSMiddleware,
allow_origins=origins,
allow_credentials=True,
allow_methods=["*"],
allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)



@app.post("/convert-image")
async def convert_image(file: UploadFile = File(...)) -> Dict[str, str]:
    """
    Accepts an image file and returns JSON with raw OCR text and beautified text.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Provided file is not an image.")

    try:
        contents = await file.read()
        logger.info("File was read successfully.")
        raw_text = get_text_from_image_cohere(contents) # Use Tesseract OCR to extract raw text from image
        logger.info(f"Successfully received raw OCR text: {raw_text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")


    try:
        beautified = beautify_text(raw_text)
        logger.info(f"Successfully received beautified text: {beautified}")
    except Exception as e:
        return {
        "raw_text": raw_text,
        "beautified_text": "",
        "error": f"Beautification failed: {str(e)}",
        }


    return {"raw_text": raw_text, "beautified_text": beautified}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)