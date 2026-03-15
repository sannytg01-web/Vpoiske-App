import React from 'react';

export interface StepIndicatorProps {
  totalSteps: number; // For now spec says 3 dots
  currentStep: number; // 0-indexed
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ totalSteps = 3, currentStep }) => {
  return (
    <div className="flex flex-row items-center w-full max-w-[240px] mx-auto justify-between relative px-2">
      {/* Background Line */}
      <div 
        className="absolute left-6 right-6 top-1/2 -translate-y-1/2 z-0" 
        style={{
          height: '2px',
          background: 'var(--border-card)',
        }}
      />
      {/* Active Line Overlap */}
      <div 
        className="absolute left-6 top-1/2 -translate-y-1/2 z-0" 
        style={{
          height: '2px',
          background: 'var(--gradient-accent)',
          width: `${(Math.min(currentStep, totalSteps - 1) / (totalSteps - 1)) * 100}%`,
          transition: 'width var(--transition-normal)'
        }}
      />

      {Array.from({ length: totalSteps }).map((_, i) => {
        let bg = 'var(--bg-card)';
        let border = '1px solid var(--border-card)';
        
        if (i < currentStep) {
          bg = 'var(--gradient-accent)';
          border = 'none';
        } else if (i === currentStep) {
          bg = 'var(--accent-warm)';
          border = 'none';
        }

        return (
          <div
            key={i}
            className="flex items-center justify-center relative z-10"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: bg,
              border: border,
              transition: 'all var(--transition-normal)',
              boxShadow: i <= currentStep ? '0 0 10px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            {/* Optional internal text or checkmark */}
            {i < currentStep && (
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
};
