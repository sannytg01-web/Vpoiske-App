import React from 'react';

export interface SectionTagProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionTag: React.FC<SectionTagProps> = ({ children, className = '' }) => {
  return (
    <span
      className={`text-label inline-flex items-center justify-center ${className}`}
      style={{
        background: 'rgba(74,158,127,0.15)',
        color: 'var(--accent-secondary)',
        border: '1px solid rgba(74,158,127,0.25)',
        borderRadius: 'var(--radius-pill)',
        padding: '4px 10px',
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </span>
  );
};
