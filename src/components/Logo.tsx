import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  className?: string;
  animated?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  textColor = 'text-white',
  className = '',
  animated = false,
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textMap = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const IconContainer = animated ? motion.div : 'div';

  return (
    <div
      className={`inline-flex items-center gap-2.5 font-bold tracking-tight select-none group ${className}`}
      id="fitora-brand-logo"
    >
      <IconContainer
        {...(animated
          ? {
              initial: { scale: 0.9, opacity: 0 },
              animate: { scale: 1, opacity: 1 },
              whileHover: { scale: 1.05 },
              transition: { type: 'spring', stiffness: 350, damping: 20 },
            }
          : {})}
        className={`${sizeMap[size]} bg-[#0f1218] rounded-xl flex items-center justify-center p-1.5 shadow-md shadow-black/20 flex-shrink-0 relative overflow-hidden transition-all duration-200 group-hover:shadow-lime-500/10 group-hover:border-lime-500/30`}
        aria-label="Fitora Logo Icon"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M38 22H82L70 38H26L38 22Z"
            fill="#a3e635"
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
          <path d="M20 44H74L60 60H34L26 78H12L20 44Z" fill="#ffffff" />
          <path d="M36 64H58L48 78H26L36 64Z" fill="#ffffff" />
        </svg>
      </IconContainer>
      {showText && (
        <span
          className={`${textMap[size]} ${textColor} font-extrabold tracking-wide font-sans transition-colors duration-200`}
        >
          Fitora
        </span>
      )}
    </div>
  );
};

export const AdminLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`inline-flex items-center gap-2.5 ${className}`} id="irondesk-admin-logo">
    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path
          d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
    <div className="flex flex-col">
      <span className="text-white font-bold text-base leading-tight tracking-tight">
        IronDesk
      </span>
      <span className="text-[10px] uppercase font-semibold tracking-wider text-amber-400/90">
        ADMIN PORTAL
      </span>
    </div>
  </div>
);
