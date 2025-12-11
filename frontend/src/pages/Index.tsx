import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { StageIndicator } from '@/components/StageIndicator';
import { ResumeUpload } from '@/components/ResumeUpload';
import { StartInterview } from '@/components/StartInterview';
import InterviewSession from '@/components/InterviewSession';
import { FeedbackDisplay } from '@/components/FeedbackDisplay';
import type { InterviewState, ResumeData, FeedbackData } from '@/types/interview';
import { endInterview, sendTranscription, startInterview } from '@/lib/api';

const mockFeedback: FeedbackData = {
  overallScore: 78,
  evaluation: "You demonstrated strong communication skills and a solid understanding of your technical background. Your responses were well-structured and showed genuine enthusiasm for the role. However, there's room for improvement in providing more specific examples and quantifying your achievements.",
  strengths: [
    "Clear and articulate communication style",
    "Strong technical knowledge demonstration",
    "Good enthusiasm and positive attitude",
    "Well-prepared with relevant examples",
  ],
  weaknesses: [
    "Could provide more quantifiable results in examples",
    "Some responses were slightly lengthy",
    "Need to elaborate more on leadership experiences",
  ],
  suggestions: [
    "Practice the STAR method (Situation, Task, Action, Result) to structure your answers more effectively and include measurable outcomes.",
    "Prepare 3-5 key achievements with specific metrics (percentages, dollar amounts, time saved) that you can reference across different questions.",
    "Work on concise responses - aim for 1-2 minute answers for most questions, leaving room for follow-up.",
    "Research common behavioral questions for your target role and prepare tailored examples.",
  ],
  duration: 847,
};

export default function Index() {
  const [state, setState] = useState<InterviewState>({
    stage: 'upload',
    resume: null,
    isMicActive: true,
    isProcessing: false,
    feedback: null,
    interviewStartTime: null,
    conversation: [],
    currentQuestion: null,
    lastError: null,
  });

  const handleResumeUpload = (resume: ResumeData) => {
    setState(prev => ({
      ...prev,
      resume,
      stage: 'ready',
    }));
  };

  const handleStartInterview = async () => {
    setState(prev => ({
      ...prev,
      isProcessing: true,
      lastError: null,
    }));

    try {
      const { response } = await startInterview();
      const intro = "Hi, I'm your AI interviewer. Let's begin.";
      const firstQuestion = `${intro} ${response || "Tell me about yourself."}`;

      setState(prev => ({
        ...prev,
        stage: 'interviewing',
        interviewStartTime: new Date(),
        isProcessing: false,
        currentQuestion: firstQuestion,
        conversation: [
          ...prev.conversation,
          { from: 'ai', text: firstQuestion, timestamp: Date.now() },
        ],
      }));
    } catch (err) {
      console.error("START INTERVIEW ERROR:", err);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        lastError: "Unable to start the interview. Check the backend server.",
      }));
    }
  };

  const handleToggleMic = () => {
    setState(prev => ({
      ...prev,
      isMicActive: !prev.isMicActive,
    }));
  };

  const handleSendAnswer = async (answer: string) => {
    if (!answer.trim()) return;

    const userTurn = { from: 'user' as const, text: answer.trim(), timestamp: Date.now() };

    setState(prev => ({
      ...prev,
      conversation: [...prev.conversation, userTurn],
      isProcessing: true,
      lastError: null,
    }));

    try {
      const { response } = await sendTranscription(answer);
      const followUp = response || "Thanks for your response. Can you share more details?";

      setState(prev => ({
        ...prev,
        isProcessing: false,
        currentQuestion: followUp,
        conversation: [
          ...prev.conversation,
          { from: 'ai' as const, text: followUp, timestamp: Date.now() },
        ],
      }));
    } catch (err) {
      console.error("SEND ANSWER ERROR:", err);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        lastError: "Unable to send your response. Please retry.",
      }));
    }
  };

  const handleEndInterview = async () => {
    setState(prev => ({ ...prev, isProcessing: true, lastError: null }));

    try {
      const { response } = await endInterview(state.conversation);
      const normalized: FeedbackData = {
        overallScore: response?.overallScore ?? mockFeedback.overallScore,
        evaluation: response?.evaluation ?? mockFeedback.evaluation,
        strengths: response?.strengths ?? mockFeedback.strengths,
        weaknesses: response?.weaknesses ?? mockFeedback.weaknesses,
        suggestions: response?.suggestions ?? mockFeedback.suggestions,
        duration: response?.duration ?? mockFeedback.duration,
      };
      setState(prev => ({
        ...prev,
        isProcessing: false,
        stage: 'feedback',
        feedback: normalized,
      }));
      return;
    } catch (err) {
      console.error("END INTERVIEW ERROR:", err);
    }

    setState(prev => ({
      ...prev,
      isProcessing: false,
      stage: 'feedback',
      feedback: mockFeedback,
    }));
  };

  const handleRestart = () => {
    setState({
      stage: 'upload',
      resume: null,
      isMicActive: true,
      isProcessing: false,
      feedback: null,
      interviewStartTime: null,
      conversation: [],
      currentQuestion: null,
      lastError: null,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col items-center px-4 pb-12">
        <StageIndicator currentStage={state.stage} />
        
        <AnimatePresence mode="wait">
          {state.stage === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <ResumeUpload 
                onUploadComplete={handleResumeUpload}
                isProcessing={state.isProcessing}
              />
            </motion.div>
          )}

          {state.stage === 'ready' && state.resume && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <StartInterview 
                resume={state.resume}
                onStart={handleStartInterview}
              />
            </motion.div>
          )}

          {state.stage === 'interviewing' && state.interviewStartTime && (
            
            <motion.div
              key="interviewing"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <InterviewSession
                isMicActive={state.isMicActive}
                isAISpeaking={state.isProcessing}
                onToggleMic={handleToggleMic}
                onEndInterview={handleEndInterview}
                startTime={state.interviewStartTime}
                currentQuestion={state.currentQuestion}
                conversation={state.conversation}
                onSendAnswer={handleSendAnswer}
                isProcessing={state.isProcessing}
                error={state.lastError}
              />
            </motion.div>
          )}

          {state.stage === 'feedback' && state.feedback && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <FeedbackDisplay 
                feedback={state.feedback}
                onRestart={handleRestart}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
