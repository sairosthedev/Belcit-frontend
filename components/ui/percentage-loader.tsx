"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface LoadingStep {
  name: string;
  duration: number;
  icon?: string;
}

interface PercentageLoaderProps {
  steps?: LoadingStep[];
  onComplete?: () => void;
}

const defaultSteps: LoadingStep[] = [
  { name: "Initializing BELCIT Trading", duration: 800, icon: "🚀" },
  { name: "Connecting to server", duration: 1000, icon: "🌐" },
  { name: "Checking authentication", duration: 800, icon: "🔐" },
  { name: "Loading application", duration: 600, icon: "💼" },
  { name: "Setting up workspace", duration: 500, icon: "🖥️" },
  { name: "Ready to use", duration: 300, icon: "✅" },
];

export function PercentageLoader({ steps = defaultSteps, onComplete }: PercentageLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [currentStepProgress, setCurrentStepProgress] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;
    
    const runStep = (stepIndex: number) => {
      if (stepIndex >= steps.length) {
        setPercentage(100);
        setTimeout(() => {
          onComplete?.();
        }, 500);
        return;
      }

      const step = steps[stepIndex];
      const stepStartPercentage = (stepIndex / steps.length) * 100;
      const stepEndPercentage = ((stepIndex + 1) / steps.length) * 100;
      
      setCurrentStep(stepIndex);
      setCurrentStepProgress(0);
      
      // Animate progress for this step
      const stepInterval = 50; // Update every 50ms
      const stepDuration = step.duration;
      const totalUpdates = stepDuration / stepInterval;
      let updates = 0;
      
      intervalId = setInterval(() => {
        updates++;
        const stepProgress = Math.min((updates / totalUpdates) * 100, 100);
        const overallProgress = stepStartPercentage + (stepProgress / 100) * (stepEndPercentage - stepStartPercentage);
        
        setCurrentStepProgress(stepProgress);
        setPercentage(Math.floor(overallProgress));
        
        if (updates >= totalUpdates) {
          clearInterval(intervalId);
          timeoutId = setTimeout(() => runStep(stepIndex + 1), 100);
        }
      }, stepInterval);
    };

    // Start loading sequence
    const startTimeout = setTimeout(() => runStep(0), 300);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [steps, onComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-4 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.1),transparent_50%)]" />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-slate-800 rounded-2xl blur-xl opacity-30 animate-pulse" />
        <div className="relative rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border-4 border-white dark:border-slate-700 p-8">
          <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-slate-800 dark:from-blue-400 dark:to-slate-300">
            BT
          </span>
        </div>
      </motion.div>

      {/* Company Name */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-600 to-slate-800 dark:from-slate-100 dark:via-blue-400 dark:to-slate-300 mb-2">
          BELCIT TRADING
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-slate-800 mx-auto rounded-full mb-4" />
      </motion.div>

      {/* Loading Progress */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="w-full max-w-md space-y-6"
      >
        {/* Percentage Circle */}
        <div className="relative flex items-center justify-center">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-slate-200 dark:text-slate-700"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className="text-blue-600 dark:text-blue-400"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: percentage / 100 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                pathLength: percentage / 100,
                strokeDasharray: "283", // 2 * π * 45
                strokeDashoffset: 283 - (283 * percentage) / 100,
              }}
            />
          </svg>
          
          {/* Percentage Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              key={percentage}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold text-slate-900 dark:text-slate-100"
            >
              {percentage}%
            </motion.span>
          </div>
        </div>

        {/* Current Step */}
        <div className="text-center space-y-3">
          <motion.div
            key={currentStep}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-3"
          >
            <span className="text-2xl" role="img" aria-label="loading-icon">
              {steps[currentStep]?.icon || "⏳"}
            </span>
            <span className="text-lg font-medium text-slate-700 dark:text-slate-300">
              {steps[currentStep]?.name || "Loading..."}
            </span>
          </motion.div>

          {/* Step Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
              animate={{ width: `${currentStepProgress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>

          {/* Step Counter */}
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex gap-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
                className="w-2 h-2 bg-blue-600 rounded-full"
              />
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center mt-8"
      >
        <p className="text-xs text-slate-500 dark:text-slate-400">
          © 2025 Belcit Trading • Enterprise POS System
        </p>
      </motion.div>
    </div>
  );
}
