"""FastAPI server exposing POST /convert-image"""

import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
import uvicorn

from ocr import get_text_from_image
from cohere import beautify_text
from src.controllers.auth.auth_controller import router as auth_router

app = FastAPI(title="OCR + Beautify API")


# Allow the Three.js frontend on localhost:3000 and Vite dev server
origins = [
"http://localhost:3000",
"http://127.0.0.1:3000",
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

# Include authentication routes
app.include_router(auth_router)



@app.post("/convert-image")
async def convert_image(file: UploadFile = File(...)) -> Dict[str, str]:
    """Accepts an image file and returns JSON with raw OCR text and beautified text."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Provided file is not an image.")


    try:
        contents = await file.read()
        raw_text = get_text_from_image(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")


    try:
        beautified = beautify_text(raw_text)
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