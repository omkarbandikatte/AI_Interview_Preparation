import { motion } from 'framer-motion';
import { Play, FileCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ResumeData } from '@/types/interview';

interface StartInterviewProps {
  resume: ResumeData;
  onStart: () => void;
}

export function StartInterview({ resume, onStart }: StartInterviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-xl mx-auto text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-success/20 flex items-center justify-center"
      >
        <FileCheck className="w-12 h-12 text-success" />
      </motion.div>
      
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-foreground mb-3"
      >
        Resume Processed
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground mb-8"
      >
        Your resume <span className="font-medium text-foreground">{resume.fileName}</span> has been analyzed and is ready for your interview.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-2xl p-6 mb-8"
      >
        <div className="flex items-start gap-4 text-left">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">What to expect</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• AI-powered interview questions tailored to your experience</li>
              <li>• Real-time voice interaction with natural conversation flow</li>
              <li>• Comprehensive feedback and improvement suggestions</li>
            </ul>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          variant="hero"
          onClick={onStart}
          className="group"
        >
          <Play className="w-5 h-5 transition-transform group-hover:scale-110" />
          Start Interview
        </Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-xs text-muted-foreground mt-4"
      >
        Make sure your microphone is ready and you're in a quiet environment
      </motion.p>
    </motion.div>
  );
}
