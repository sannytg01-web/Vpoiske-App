import React, { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', disabled, children, ...props }, ref) => {
    
    const baseStyle: React.CSSProperties = {
      width: '100%',
      padding: '16px 24px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-pill)',
      border: 'none',
      color: 'var(--text-on-accent)',
      transition: 'transform var(--transition-fast), opacity var(--transition-fast)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
    };

    let specificStyle: React.CSSProperties = {};
    const activeClass = disabled ? '' : 'btn-interactive';

    switch (variant) {
      case 'primary':
        specificStyle = {
          background: 'var(--gradient-accent)',
          boxShadow: 'var(--shadow-button)',
        };
        break;
      case 'secondary':
        specificStyle = {
          background: 'var(--bg-card)',
          backdropFilter: 'var(--blur-card)',
          WebkitBackdropFilter: 'var(--blur-card)',
          border: '1px solid var(--border-card)',
          color: 'var(--text-primary)',
        };
        break;
      case 'danger':
        specificStyle = {
          background: 'transparent',
          border: '1px solid var(--border-error)',
          color: 'var(--accent-error)',
        };
        break;
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`text-h3 ${activeClass} ${className}`}
        style={{ ...baseStyle, ...specificStyle }}
        {...props}
      >
        {children}
        <style>
          {`
            .btn-interactive:active {
              transform: scale(0.97);
            }
          `}
        </style>
      </button>
    );
  }
);

Button.displayName = 'Button';
