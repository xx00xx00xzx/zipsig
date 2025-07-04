import React from 'react';
import { motion } from 'framer-motion';

export const WaveBackground: React.FC = () => {
  return (
    <div className="wave-background">
      <svg className="wave-svg" viewBox="0 0 1200 320" preserveAspectRatio="none">
        <defs>
          <linearGradient id="wave1Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(0, 122, 255, 0.4)" />
            <stop offset="100%" stopColor="rgba(0, 122, 255, 0.1)" />
          </linearGradient>
          <linearGradient id="wave2Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(52, 199, 89, 0.3)" />
            <stop offset="100%" stopColor="rgba(52, 199, 89, 0.05)" />
          </linearGradient>
          <linearGradient id="wave3Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 149, 0, 0.25)" />
            <stop offset="100%" stopColor="rgba(255, 149, 0, 0.03)" />
          </linearGradient>
        </defs>
        
        {/* Wave 1 - Blue - Disable animation on mobile for performance */}
        <motion.path 
          className="wave-path wave-1"
          d="M0,0 L1200,0 L1200,200 C900,150 600,100 300,150 C200,170 100,180 0,160 Z"
          fill="url(#wave1Gradient)"
          animate={window.innerWidth > 768 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? {
            d: [
              "M0,0 L1200,0 L1200,200 C900,150 600,100 300,150 C200,170 100,180 0,160 Z",
              "M0,0 L1200,0 L1200,180 C900,130 600,120 300,170 C200,190 100,160 0,140 Z",
              "M0,0 L1200,0 L1200,220 C900,170 600,80 300,130 C200,150 100,200 0,180 Z",
              "M0,0 L1200,0 L1200,200 C900,150 600,100 300,150 C200,170 100,180 0,160 Z"
            ]
          } : undefined}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Wave 2 - Green - Disable animation on mobile for performance */}
        <motion.path 
          className="wave-path wave-2"
          d="M0,40 C300,60 600,20 900,40 C1000,50 1100,30 1200,40 L1200,240 C900,200 600,160 300,180 C200,190 100,200 0,180 Z"
          fill="url(#wave2Gradient)"
          animate={window.innerWidth > 768 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? {
            d: [
              "M0,40 C300,60 600,20 900,40 C1000,50 1100,30 1200,40 L1200,240 C900,200 600,160 300,180 C200,190 100,200 0,180 Z",
              "M0,20 C300,40 600,0 900,20 C1000,30 1100,10 1200,20 L1200,220 C900,180 600,140 300,160 C200,170 100,180 0,160 Z",
              "M0,60 C300,80 600,40 900,60 C1000,70 1100,50 1200,60 L1200,260 C900,220 600,180 300,200 C200,210 100,220 0,200 Z",
              "M0,40 C300,60 600,20 900,40 C1000,50 1100,30 1200,40 L1200,240 C900,200 600,160 300,180 C200,190 100,200 0,180 Z"
            ]
          } : undefined}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        {/* Wave 3 - Orange - Disable animation on mobile for performance */}
        <motion.path 
          className="wave-path wave-3"
          d="M0,80 C200,100 400,60 600,80 C800,100 1000,60 1200,80 L1200,280 C1000,240 800,200 600,220 C400,240 200,260 0,220 Z"
          fill="url(#wave3Gradient)"
          animate={window.innerWidth > 768 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? {
            d: [
              "M0,80 C200,100 400,60 600,80 C800,100 1000,60 1200,80 L1200,280 C1000,240 800,200 600,220 C400,240 200,260 0,220 Z",
              "M0,100 C200,120 400,80 600,100 C800,120 1000,80 1200,100 L1200,300 C1000,260 800,220 600,240 C400,260 200,280 0,240 Z",
              "M0,60 C200,80 400,40 600,60 C800,80 1000,40 1200,60 L1200,260 C1000,220 800,180 600,200 C400,220 200,240 0,200 Z",
              "M0,80 C200,100 400,60 600,80 C800,100 1000,60 1200,80 L1200,280 C1000,240 800,200 600,220 C400,240 200,260 0,220 Z"
            ]
          } : undefined}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </svg>
    </div>
  );
};