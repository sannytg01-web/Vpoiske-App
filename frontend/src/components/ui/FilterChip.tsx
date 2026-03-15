import React from 'react';
import type { ButtonHTMLAttributes } from 'react';

export interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const FilterChip: React.FC<FilterChipProps> = ({ active = false, children, className = '', ...props }) => {
  return (
    <button
      className={`text-body whitespace-nowrap ${className}`}
      style={{
        padding: '8px 16px',
        borderRadius: 'var(--radius-pill)',
        background: active ? 'var(--gradient-accent)' : 'var(--bg-card)',
        border: active ? '1px solid transparent' : '1px solid var(--border-card)',
        color: active ? 'var(--text-on-accent)' : 'var(--text-secondary)',
        backdropFilter: active ? 'none' : 'var(--blur-card)',
        transition: 'all var(--transition-fast)',
      }}
      {...props}
    >
      {children}
    </button>
  );
};
