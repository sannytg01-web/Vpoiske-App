import React from 'react';

export interface ProgressBarProps {
  steps: number;
  currentStep: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex flex-row items-center justify-between w-full space-x-2">
      {Array.from({ length: steps }).map((_, i) => {
        let background = 'var(--border-subtle)'; // pending
        if (i < currentStep) background = 'var(--gradient-accent)'; // completed
        else if (i === currentStep) background = 'var(--accent-warm)'; // current

        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: '3px',
              borderRadius: 'var(--radius-pill)',
              background,
              transition: 'background var(--transition-normal)',
            }}
          />
        );
      })}
    </div>
  );
};
