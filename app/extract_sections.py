from groq import Groq
import pdfplumber
import dotenv
import os
import json
import re

dotenv.load_dotenv()

def safe_json_parse(llm_output: str):
    cleaned = re.sub(r"```json|```", "", llm_output).strip()
    cleaned = cleaned[cleaned.find("{"):]
    cleaned = cleaned[: cleaned.rfind("}") + 1]
    return json.loads(cleaned)

def extract_sections_from_resume(resume_text):
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    prompt = f"""
            Extract the following sections from this resume text and return clean JSON:
        1. Projects
        2. Technical Skills
        3. Experience / Achievements
        4. Education
        5. Leadership (if available)
        6. Certifications

        Resume text: {resume_text}
    """
    response = client.chat.completions.create(
        model = "llama-3.3-70b-versatile",

        messages=[{"role": "user", "content": prompt}]
    )

    structured_resume = response.choices[0].message.content
    return safe_json_parse(structured_resume)