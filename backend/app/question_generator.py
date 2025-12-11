from groq import Groq
import json
import os

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

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


def generate_interview_feedback(history):
    prompt = f"""
Provide final interview feedback based on this conversation:

{json.dumps(history, indent=2)}

Include:
- Strengths
- Weaknesses
- Technical skills assessment
- Communication assessment
- Suggestions to improve

Keep the feedback polite and concise.
"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content
