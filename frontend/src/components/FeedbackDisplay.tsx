import { motion } from 'framer-motion';
import { Trophy, ThumbsUp, AlertTriangle, Lightbulb, Clock, RotateCcw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { FeedbackData } from '@/types/interview';

interface FeedbackDisplayProps {
  feedback: FeedbackData;
  onRestart: () => void;
}

export function FeedbackDisplay({ feedback, onRestart }: FeedbackDisplayProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} min ${secs} sec`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Satisfactory';
    return 'Needs Improvement';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full max-w-3xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-success/20 flex items-center justify-center">
          <Trophy className="w-10 h-10 text-success" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Interview Complete!</h2>
        <p className="text-muted-foreground">Here's your performance summary</p>
      </motion.div>

      {/* Score Card */}
      <motion.div 
        variants={itemVariants}
        className="glass-card-elevated rounded-2xl p-8 mb-6"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-sm font-medium text-muted-foreground mb-1">Overall Score</p>
            <div className="flex items-baseline gap-2">
              <span className={cn("text-6xl font-bold", getScoreColor(feedback.overallScore))}>
                {feedback.overallScore}
              </span>
              <span className="text-2xl text-muted-foreground">/100</span>
            </div>
            <p className={cn("font-medium mt-1", getScoreColor(feedback.overallScore))}>
              {getScoreLabel(feedback.overallScore)}
            </p>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="font-semibold text-foreground">{formatDuration(feedback.duration)}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-foreground leading-relaxed">{feedback.evaluation}</p>
        </div>
      </motion.div>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <ThumbsUp className="w-5 h-5 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Strengths</h3>
          </div>
          <ul className="space-y-3">
            {feedback.strengths.map((strength, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-start gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" />
                <span className="text-muted-foreground">{strength}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Areas to Improve</h3>
          </div>
          <ul className="space-y-3">
            {feedback.weaknesses.map((weakness, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-warning mt-2 shrink-0" />
                <span className="text-muted-foreground">{weakness}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Suggestions */}
      <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Improvement Suggestions</h3>
        </div>
        <ul className="space-y-4">
          {feedback.suggestions.map((suggestion, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
            >
              <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-sm font-semibold flex items-center justify-center shrink-0">
                {index + 1}
              </span>
              <span className="text-muted-foreground">{suggestion}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Actions */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <Button variant="hero" onClick={onRestart} className="w-full sm:w-auto">
          <RotateCcw className="w-5 h-5" />
          Start New Interview
        </Button>
        <Button variant="hero-outline" className="w-full sm:w-auto">
          <Download className="w-5 h-5" />
          Download Report
        </Button>
      </motion.div>
    </motion.div>
  );
}
