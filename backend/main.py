from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from app.resumereader import extract_text_from_pdf
from app.extract_sections import extract_sections_from_resume
from app.resume_cache import resume_cache
from app.question_generator import (
    generate_interview_question,
    generate_followup_question,
    generate_interview_feedback
)
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
        "extracted_sections": extracted_sections,
    }

@app.post("/vapi-webhook")
async def vapi_webhook(request: Request):
    body = await request.json()
    event = body.get("event")
    data = body.get("data", {})

    resume = resume_cache.get("resume", {})
    history = resume_cache.get("conversation_history", [])

    # 1️⃣ When user starts the call → send first interview question
    if event == "call.started":
        first_q = generate_interview_question(resume)
        resume_cache["conversation_history"] = [{"from": "ai", "text": first_q}]
        return {"response": first_q}

    # 2️⃣ When user finishes speaking (STT done)
    if event == "input.transcription.completed":
        user_text = data.get("text", "")

        if not user_text.strip():
            return {"response": "Sorry, I didn't hear you clearly. Could you repeat that?"}

        follow_up = generate_followup_question(user_text, resume)
        history.append({"from": "user", "text": user_text})
        history.append({"from": "ai", "text": follow_up})
        resume_cache["conversation_history"] = history
        return {"response": follow_up}

    # 3️⃣ When call ends → produce final feedback
    if event == "call.ended":
        feedback = generate_interview_feedback(history)
        return {"response": feedback}

    return {"status": "ignored"}
