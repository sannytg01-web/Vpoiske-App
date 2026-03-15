import React from 'react';
import { Heart, Stars } from 'lucide-react';

export interface CompatScoreProps {
  score: number; // 0 to 100
  label?: string;
}

export const CompatScore: React.FC<CompatScoreProps> = ({ score, label = "Общая совместимость" }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center mb-2">
        <svg width="80" height="80" viewBox="0 0 100 100">
          <circle 
            cx="50" cy="50" r="45" 
            fill="transparent" 
            stroke="var(--border-subtle)" 
            strokeWidth="8" 
          />
          <circle 
            cx="50" cy="50" r="45" 
            fill="transparent" 
            stroke="url(#compatGradient)" 
            strokeWidth="8"
            strokeDasharray={`${(score / 100) * 283} 283`}
            strokeDashoffset="0"
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dasharray 1s ease-out' }}
          />
          <defs>
            <linearGradient id="compatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--accent-primary)" />
              <stop offset="100%" stopColor="var(--accent-secondary)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-h2 text-white mb-0">{score}%</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {score > 80 ? <Stars size={16} color="var(--accent-warm)" /> : <Heart size={16} color="var(--accent-error)" />}
        <span className="text-caption text-secondary font-medium">{label}</span>
      </div>
    </div>
  );
};
