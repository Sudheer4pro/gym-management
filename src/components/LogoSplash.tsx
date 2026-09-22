import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LogoSplashProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export const LogoSplash: React.FC<LogoSplashProps> = ({
  onComplete,
  minDurationMs = 1800,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, minDurationMs);

    return () => clearTimeout(timer);
  }, [minDurationMs]);

  const handleExitComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isVisible && (
        <motion.div
          key="fitora-splash-screen"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            filter: 'blur(6px)',
            transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07090e] text-white select-none overflow-hidden"
          id="fitora-splash-screen"
          onClick={() => setIsVisible(false)}
        >
          {/* Subtle radial ambient background glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 0.35, scale: 1.2 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute w-96 h-96 rounded-full bg-radial from-lime-500/20 via-lime-500/5 to-transparent blur-2xl pointer-events-none"
          />

          {/* Animated Brand Emblem & Typography */}
          <div className="relative flex flex-col items-center z-10">
            {/* Logo Badge Icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative mb-5"
            >
              {/* Outer pulsing glow ring */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: [0, 0.6, 0.2],
                  scale: [0.8, 1.25, 1.1],
                }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 rounded-2xl bg-[#a3e635]/25 blur-lg -z-10"
              />

              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#0e121a] border border-slate-800/80 rounded-2xl sm:rounded-3xl flex items-center justify-center p-3.5 sm:p-4 shadow-2xl shadow-black/80 relative overflow-hidden">
                {/* SVG Paths with progressive entry transitions */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full drop-shadow-md"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Top neon lime bar: slides in from top-left */}
                  <motion.path
                    d="M38 22H82L70 38H26L38 22Z"
                    fill="#a3e635"
                    initial={{ opacity: 0, x: -25, y: -10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{
                      delay: 0.18,
                      duration: 0.55,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  />
                  {/* Mid-stem white bar: slides in from bottom-left */}
                  <motion.path
                    d="M20 44H74L60 60H34L26 78H12L20 44Z"
                    fill="#ffffff"
                    initial={{ opacity: 0, x: -20, y: 15 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{
                      delay: 0.32,
                      duration: 0.55,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  />
                  {/* Lower white bar: slides in from center */}
                  <motion.path
                    d="M36 64H58L48 78H26L36 64Z"
                    fill="#ffffff"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.44,
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  />
                </svg>

                {/* Sweeping shimmer highlight across the emblem */}
                <motion.div
                  initial={{ x: '-150%' }}
                  animate={{ x: '180%' }}
                  transition={{
                    delay: 0.6,
                    duration: 0.9,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
                />
              </div>
            </motion.div>

            {/* Wordmark "Fitora" */}
            <motion.div
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{
                delay: 0.45,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex items-center gap-1.5"
            >
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider text-white font-sans">
                Fitora
              </h1>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring', stiffness: 400, damping: 15 }}
                className="w-2 h-2 rounded-full bg-[#a3e635] shadow-xs shadow-lime-400/80"
              />
            </motion.div>

            {/* Tagline / Category text */}
            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.1em' }}
              animate={{ opacity: 1, letterSpacing: '0.22em' }}
              transition={{
                delay: 0.65,
                duration: 0.6,
                ease: 'easeOut',
              }}
              className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase mt-1.5"
            >
              GYM MANAGEMENT SUITE
            </motion.p>

            {/* Progress indicator bar */}
            <div className="w-36 sm:w-44 h-0.5 bg-slate-800/80 rounded-full mt-6 overflow-hidden relative">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{
                  duration: minDurationMs / 1000 - 0.2,
                  ease: 'easeInOut',
                }}
                className="h-full w-full bg-gradient-to-r from-lime-500 to-[#a3e635] rounded-full shadow-xs shadow-lime-400/50"
              />
            </div>
          </div>

          {/* Subtle click/tap anywhere hint for fast users */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1.0, duration: 0.4 }}
            className="absolute bottom-6 text-[10px] text-slate-400 font-mono tracking-wider uppercase cursor-pointer"
          >
            Tap anywhere to proceed
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
