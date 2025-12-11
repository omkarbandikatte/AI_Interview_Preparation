import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, PhoneOff, Volume2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { InterviewMessage } from "@/types/interview";

interface InterviewSessionProps {
  isMicActive: boolean;
  isAISpeaking?: boolean;
  onToggleMic: () => void;
  onEndInterview: () => void;
  startTime: Date;
  currentQuestion: string | null;
  conversation: InterviewMessage[];
  onSendAnswer: (text: string) => void | Promise<void>;
  isProcessing: boolean;
  error: string | null;
}

export default function InterviewSession({
  isMicActive,
  isAISpeaking = false,
  onToggleMic,
  onEndInterview,
  startTime,
  currentQuestion,
  conversation,
  onSendAnswer,
  isProcessing,
  error,
}: InterviewSessionProps) {
  const [elapsed, setElapsed] = useState(0);
  const [draft, setDraft] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastAiMessage = [...conversation].reverse().find((m) => m.from === "ai");

  // Speak the latest AI message and then auto-listen
  useEffect(() => {
    if (!lastAiMessage || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(lastAiMessage.text);
    setIsSpeaking(true);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);

    utterance.onend = () => {
      setIsSpeaking(false);
      if (isMicActive) {
        startListening();
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastAiMessage?.text]);

  // Speech-to-text (single utterance)
  const startListening = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = async (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        // Put transcript into the input for user to review/edit before sending
        setDraft(transcript);
      }
    };

    recognition.start();
  };

  const handleSendDraft = () => {
    onSendAnswer(draft);
    setDraft("");
  };

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - startTime.getTime()) / 1000);
      setElapsed(diff);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Format mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-3 mb-8"
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="text-sm font-medium text-foreground">
            Interview in Progress
          </span>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-mono font-medium text-foreground">
            {formatTime(elapsed)}
          </span>
        </div>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ scale: 0.97 }}
        animate={{ scale: 1 }}
        className="glass-card-elevated rounded-3xl p-8 mb-8"
      >
        {/* AI Visualizer */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <motion.div
              className={cn(
                "w-32 h-32 rounded-full flex items-center justify-center transition-colors",
                isAISpeaking ? "bg-accent/20" : "bg-secondary"
              )}
              animate={{
                scale: isAISpeaking ? [1, 1.05, 1] : 1,
              }}
              transition={{ duration: 0.8, repeat: isAISpeaking ? Infinity : 0 }}
            >
              <Volume2
                className={cn(
                  "w-16 h-16",
                  isAISpeaking ? "text-accent" : "text-muted-foreground"
                )}
              />
            </motion.div>

            {/* Ripple Rings */}
            <AnimatePresence>
              {isAISpeaking && (
                <>
                  <motion.div
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-accent"
                  />
                  <motion.div
                    initial={{ scale: 1, opacity: 0.3 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: 0.2,
                    }}
                    className="absolute inset-0 rounded-full border-2 border-accent"
                  />
                </>
              )}
            </AnimatePresence>
          </div>

          <motion.p className="mt-4 text-lg font-medium text-foreground">
            AI Interviewer
          </motion.p>
          <p className="text-sm text-muted-foreground">
            {isListening ? "Speaking..." : "Listening..."}
          </p>
        </div>

        {/* Mic Status */}
        <motion.div className="text-center mb-8">
          <div
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
              isMicActive
                ? "bg-success/20 text-success"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isMicActive ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                </span>
                {isListening ? "Listening..." : "Microphone Active"}
              </>
            ) : (
              <>
                <MicOff className="w-4 h-4" />
                Microphone Muted
              </>
            )}
          </div>
        </motion.div>

        {/* Conversation */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 w-full">
              <p className="text-sm text-muted-foreground">
                {currentQuestion || "Waiting for the first question..."}
              </p>

              <div className="max-h-52 overflow-y-auto space-y-3 pr-1">
                {conversation.map((turn, idx) => (
                  <div
                    key={`${turn.timestamp}-${idx}`}
                    className={cn(
                      "flex",
                      turn.from === "ai" ? "justify-start" : "justify-end"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-xl px-3 py-2 text-sm shadow-sm",
                        turn.from === "ai"
                          ? "bg-secondary text-foreground"
                          : "bg-accent text-accent-foreground"
                      )}
                    >
                      {turn.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Answer input */}
        <div className="flex flex-col gap-3 mb-8">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Speak or type your answer here..."
            className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent min-h-[80px]"
            disabled={isProcessing}
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {isProcessing
                ? "Sending response..."
                : draft
                ? "Captured from mic. Review/edit, then Send Response."
                : "Speak or type your answer, then Send Response."}
            </span>
            {error && <span className="text-destructive">{error}</span>}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="hero"
              className="flex-1"
              onClick={() => {
                onSendAnswer(draft);
                setDraft("");
              }}
              disabled={isProcessing || !draft.trim()}
            >
              Send Response
            </Button>
            <Button variant="ghost" onClick={() => setDraft("")} disabled={isProcessing}>
              Clear
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          {/* Mic Toggle */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant={isMicActive ? "mic" : "mic-muted"}
              size="icon-xl"
              onClick={() => {
                onToggleMic();
                if (isMicActive) {
                  setIsListening(false);
                  if (typeof window !== "undefined" && (window as any).speechSynthesis) {
                    window.speechSynthesis.cancel();
                  }
                } else {
                  startListening();
                }
              }}
            >
              {isMicActive ? (
                <Mic className="w-7 h-7" />
              ) : (
                <MicOff className="w-7 h-7" />
              )}
            </Button>
          </motion.div>

          {/* End Call */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="end-call" size="icon-xl" onClick={onEndInterview}>
              <PhoneOff className="w-7 h-7" />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Tips */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <p className="text-sm text-muted-foreground">
          Tip: Speak clearly and pause after answering. The AI listens automatically.
        </p>
      </motion.div>
    </motion.div>
  );
}
