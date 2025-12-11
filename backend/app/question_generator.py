from groq import Groq
import json
import os
import re
from typing import List, Dict, Any

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def _safe_json(text: str) -> Dict[str, Any]:
    """Try to pull a JSON object from an LLM response; fall back to plain dict."""
    try:
        cleaned = re.sub(r"```json|```", "", text).strip()
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1:
            cleaned = cleaned[start : end + 1]
        return json.loads(cleaned)
    except Exception:
        return {}


def generate_interview_question(resume_json):
    prompt = f"""
Generate the first technical interview question based on this resume:

{json.dumps(resume_json, indent=2)}

Keep it short and natural.
"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content


def generate_followup_question(user_answer, resume_json):
    prompt = f"""
You are a technical interviewer.

The candidate answered:
"{user_answer}"

Based on this answer and resume:
{json.dumps(resume_json, indent=2)}

Generate a follow-up question. Keep it short.
"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content


def generate_interview_feedback(history: List[Dict[str, str]]):
    prompt = f"""
You are evaluating a mock interview. Conversation history:
{json.dumps(history, indent=2)}

Return STRICT JSON with:
{{
  "overallScore": number 0-100,
  "evaluation": string,
  "strengths": [string],
  "weaknesses": [string],
  "suggestions": [string]
}}

Score by comparing the user's answers to the questions, focusing on correctness, clarity, and evidence (metrics/examples). Keep texts concise.
"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    parsed = _safe_json(response.choices[0].message.content)

    # Fallback defaults if parsing failed
    if not parsed:
        parsed = {
            "overallScore": 60,
            "evaluation": "Conversation captured, but structured feedback parsing failed.",
            "strengths": [],
            "weaknesses": [],
            "suggestions": ["Try again or check the LLM response format."],
        }
    return parsed
