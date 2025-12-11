from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.resumereader import extract_text_from_pdf
from app.extract_sections import extract_sections_from_resume
from app.resume_cache import resume_cache
import os

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create upload directory
UPLOAD_DIR = os.path.join("uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    # 1. Save file into backend/uploads/
    pdf_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(pdf_path, "wb") as buffer:
        buffer.write(await file.read())

    # 2. Extract text
    extracted_text = extract_text_from_pdf(pdf_path)

    # 3. Extract structured JSON
    extracted_sections = extract_sections_from_resume(extracted_text)

    # 4. Cache it for interview flow
    resume_cache["resume"] = extracted_sections

    return {
        "status": "success",
        "file_path": pdf_path,
        "extracted_sections": extracted_sections,
        "characters": len(extracted_text),
        "preview": extracted_text[:500]
    }
