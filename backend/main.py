"""FastAPI server exposing POST /convert-image"""

import os
import logging
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Dict
import uvicorn

from .cohere import beautify_text, get_text_from_image_cohere
from .latex_compiler import compile_latex_to_pdf, check_latex_installation

class LaTeXRequest(BaseModel):
    latex_content: str

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


@app.post("/compile-latex")
async def compile_latex(request: LaTeXRequest) -> Response:
    """
    Compile LaTeX content to PDF using pdflatex.
    
    Args:
        latex_content: The LaTeX source code
        
    Returns:
        PDF file as response
    """
    try:
        # Check if LaTeX is installed
        if not check_latex_installation():
            raise HTTPException(
                status_code=500, 
                detail="LaTeX (pdflatex) is not installed. Please install a LaTeX distribution."
            )
        
        # Compile LaTeX to PDF
        pdf_bytes = compile_latex_to_pdf(request.latex_content)
        
        # Return PDF as response
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=document.pdf"
            }
        )
        
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LaTeX compilation failed: {str(e)}")


@app.get("/latex-status")
async def latex_status():
    """
    Check if LaTeX installation is available.
    
    Returns:
        Status information about LaTeX installation
    """
    is_installed = check_latex_installation()
    return {
        "latex_installed": is_installed,
        "message": "LaTeX (pdflatex) is installed and ready" if is_installed else "LaTeX (pdflatex) is not installed"
    }


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)