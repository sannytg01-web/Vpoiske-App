import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'warning' | 'error';
  interactive?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className = '', variant = 'default', interactive = false, children, ...props }, ref) => {
    
    let borderVar = 'var(--border-card)';
    if (variant === 'warning') borderVar = 'var(--border-warning)';
    else if (variant === 'error') borderVar = 'var(--border-error)';

    return (
      <div
        ref={ref}
        className={`glass-card ${interactive ? 'glass-card-interactive' : ''} ${className}`}
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'var(--blur-card)',
          WebkitBackdropFilter: 'var(--blur-card)', // for Safari
          border: `1px solid ${borderVar}`,
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          transition: 'transform var(--transition-fast)',
        }}
        {...props}
      >
        {children}
        <style>
          {`
            .glass-card-interactive:active {
              transform: scale(0.985);
            }
          `}
        </style>
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
