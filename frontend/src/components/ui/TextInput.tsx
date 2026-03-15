import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  label?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className = '', error, label, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    let borderColor = 'var(--border-subtle)';
    if (error) borderColor = 'var(--border-error)';
    else if (focused) borderColor = 'var(--border-active)';

    return (
      <div className="w-full flex-col flex">
        {label && (
          <label className="text-label text-muted mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full text-body ${className}`}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={{
            background: 'var(--bg-input)',
            border: `1px solid ${borderColor}`,
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'border var(--transition-fast)',
          }}
          {...props}
        />
        <style>
          {`
            input::placeholder {
              color: var(--text-muted);
            }
          `}
        </style>
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';
