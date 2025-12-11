from fastapi import FastAPI, UploadFile, File
from app.resumereader import extract_text_from_pdf
from app.extract_sections import extract_sections_from_resume
from app.resume_cache import resume_cache
from app.question_generator import generate_interview_question

app = FastAPI()



@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    # 1. Save uploaded file temporarily
    pdf_path = f"temp_{file.filename}"
    with open(pdf_path, "wb") as buffer:
        buffer.write(await file.read())

    # 2. Extract raw text from PDF
    extracted_text = extract_text_from_pdf(pdf_path)

    # 3. Extract structured JSON using LLM
    extract_section = extract_sections_from_resume(extracted_text)

    # 4. Store it in memory for Vapi interview
    resume_cache["resume"] = extract_section

    return {
        "status": "success",
        "resume_text": extracted_text,
        "extracted_sections": extract_section,
        "extracted_characters": len(extracted_text),
        "preview": extracted_text[:500]
    }
