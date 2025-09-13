# easy_click.py
import requests
import pytesseract
from PIL import Image

# --- Tesseract OCR for general text ---
def extract_text_tesseract(image_path):
    img = Image.open(image_path)
    text = pytesseract.image_to_string(img)
    return text

# --- Mathpix OCR for LaTeX (math) ---
def extract_latex_mathpix(image_path, app_id, app_key):
    with open(image_path, "rb") as image_file:
        image_data = image_file.read()
    headers = {
        "app_id": app_id,
        "app_key": app_key,
        "Content-type": "application/json"
    }
    data = {
        "src": f"data:image/png;base64,{image_data.hex()}",
        "formats": ["latex_styled"]
    }
    response = requests.post("https://api.mathpix.com/v3/text", json=data, headers=headers)
    result = response.json()
    return result.get("latex_styled", "")

if __name__ == "__main__":
    image_path = "your_image.png"  # Change to your image file
    # Tesseract OCR
    print("General Text OCR:")
    print(extract_text_tesseract(image_path))

    # Mathpix OCR (LaTeX)
    app_id = "your_app_id"   # Replace with your Mathpix app_id
    app_key = "your_app_key" # Replace with your Mathpix app_key
    print("\nLaTeX OCR (Mathpix):")
    print(extract_latex_mathpix(image_path, app_id, app_key))