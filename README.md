# AI Interview Preparation Platform

An AI-powered interview preparation platform that analyzes resumes and conducts personalized mock interviews with real-time voice interaction.

## Features

- 📄 **Resume Upload & Analysis** - Upload PDF resumes and extract structured information
- 🎤 **Voice-Enabled Interviews** - Real-time voice interaction with AI interviewer
- 💬 **Dynamic Q&A** - AI generates personalized questions based on your resume
- 📊 **Performance Feedback** - Get detailed feedback with scores, strengths, and improvement suggestions
- 🎯 **Keyword-Based Scoring** - Answers are evaluated using keyword matching and LLM analysis

## Tech Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: FastAPI + Python
- **AI/LLM**: Groq API (Llama 3.3 70B)
- **Voice**: Browser Speech Recognition & Synthesis

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.12+
- Groq API Key ([Get one here](https://console.groq.com))

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd AI_Interview_Preparation
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set Environment Variables**
   ```bash
   # Create .env file in backend/
   echo "GROQ_API_KEY=your_api_key_here" > .env
   ```

4. **Start Backend**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

5. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

6. **Set Frontend Environment Variables**
   ```bash
   # Create .env file in frontend/
   echo "VITE_API_URL=http://127.0.0.1:8000" > .env
   ```

7. **Start Frontend**
   ```bash
   npm run dev
   ```

8. **Open Browser**
   - Frontend: http://localhost:5173
   - Backend API Docs: http://localhost:8000/docs

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**
- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Render

## Project Structure

```
AI_Interview_Preparation/
├── backend/
│   ├── app/
│   │   ├── extract_sections.py    # Resume parsing
│   │   ├── question_generator.py  # LLM question generation
│   │   ├── resumereader.py         # PDF text extraction
│   │   └── resume_cache.py         # In-memory storage
│   ├── main.py                     # FastAPI app
│   ├── requirements.txt
│   └── render.yaml                 # Render deployment config
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── pages/                 # Page components
│   │   ├── lib/                   # API utilities
│   │   └── types/                 # TypeScript types
│   ├── package.json
│   └── vercel.json                # Vercel deployment config
└── DEPLOYMENT.md                  # Deployment guide
```

## Environment Variables

### Backend
- `GROQ_API_KEY` - Your Groq API key

### Frontend
- `VITE_API_URL` - Backend API URL (default: http://127.0.0.1:8000)

## API Endpoints

- `POST /upload-resume` - Upload and parse resume
- `POST /vapi-webhook` - Interview flow webhook (call.started, input.transcription.completed, call.ended)
- `GET /docs` - Interactive API documentation

## License

MIT
