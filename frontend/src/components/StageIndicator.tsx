import { motion } from 'framer-motion';
import { Check, Upload, PlayCircle, MessageSquare, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InterviewStage } from '@/types/interview';

interface StageIndicatorProps {
  currentStage: InterviewStage;
}

const stages = [
  { id: 'upload', label: 'Upload Resume', icon: Upload },
  { id: 'ready', label: 'Start Interview', icon: PlayCircle },
  { id: 'interviewing', label: 'Interview', icon: MessageSquare },
  { id: 'feedback', label: 'Feedback', icon: BarChart3 },
];

export function StageIndicator({ currentStage }: StageIndicatorProps) {
  const currentIndex = stages.findIndex(s => s.id === currentStage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto mb-12 px-4"
    >
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border">
          <motion.div
            className="h-full bg-accent"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {stages.map((stage, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const Icon = stage.icon;

            return (
              <div key={stage.id} className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-10",
                    isCompleted && "bg-accent text-accent-foreground",
                    isCurrent && "bg-primary text-primary-foreground shadow-elevated",
                    !isCompleted && !isCurrent && "bg-card border-2 border-border text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </motion.div>
                <span className={cn(
                  "mt-2 text-xs font-medium text-center hidden sm:block",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
