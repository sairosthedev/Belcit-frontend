"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface AppLoaderProps {
  onComplete?: () => void;
  message?: string;
}

export function AppLoader({ onComplete, message = "Loading..." }: AppLoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete?.(), 200);
          return 100;
        }
        return prev + Math.random() * 15 + 5; // Random increment between 5-20
      });
    }, 200);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-6 p-6">
        {/* Logo with pulse effect */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-30" />
          <div className="relative rounded-xl bg-white dark:bg-slate-800 shadow-xl border-2 border-blue-100 dark:border-slate-700 p-4">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              BT
            </span>
          </div>
        </motion.div>

        {/* Progress Circle */}
        <div className="relative">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="text-slate-200 dark:text-slate-700"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              className="text-blue-600"
              animate={{
                strokeDashoffset: 251.2 - (251.2 * Math.min(progress, 100)) / 100,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                strokeDasharray: "251.2", // 2 * π * 40
              }}
            />
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {Math.floor(Math.min(progress, 100))}%
            </span>
          </div>
        </div>

        {/* Message */}
        <div className="text-center">
          <div className="text-base font-medium text-slate-900 dark:text-slate-100 mb-1">
            {message}
          </div>
          <div className="w-32 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Animated dots */}
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
              className="w-1.5 h-1.5 bg-blue-500 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
