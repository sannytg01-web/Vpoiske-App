import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, disabled }) => {
  return (
    <div
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: '44px',
        height: '24px',
        borderRadius: 'var(--radius-pill)',
        background: checked ? 'var(--gradient-accent)' : 'transparent',
        border: checked ? '1px solid transparent' : '1px solid var(--border-subtle)',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background var(--transition-normal), border var(--transition-normal)',
      }}
    >
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: 'var(--text-primary)',
          position: 'absolute',
          top: '1px',
          left: '1px',
          transform: `translateX(${checked ? '20px' : '0px'})`,
          transition: 'transform var(--transition-normal)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      />
    </div>
  );
};
