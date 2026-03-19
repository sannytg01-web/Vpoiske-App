import React, { useState } from 'react';
import { Send } from 'lucide-react';

export interface ChatInputProps {
  onSend: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (val: string) => void;
  rightAddon?: React.ReactNode;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, placeholder = 'Сообщение...', disabled, value, onChange, rightAddon }) => {
  const [internalText, setInternalText] = useState('');
  
  const text = value !== undefined ? value : internalText;
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) onChange(e.target.value);
    setInternalText(e.target.value);
  };
  
  const hasText = text.trim().length > 0;

  const handleSend = () => {
    if (hasText && !disabled) {
      onSend(text.trim());
      if (onChange) onChange('');
      setInternalText('');
    }
  };

  return (
    <div 
      className="w-full flex flex-row items-end space-x-2 px-4 py-3 pb-8"
      style={{
        background: 'var(--bg-primary)', // or transparent depending on layout
      }}
    >
      <div className="flex-1 relative">
        <textarea
          value={text}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          style={{
            width: '100%',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            padding: `12px ${rightAddon ? '52px' : '16px'} 12px 16px`,
            color: 'var(--text-primary)',
            outline: 'none',
            resize: 'none',
            minHeight: '44px',
            maxHeight: '120px',
            fontSize: '15px',
            lineHeight: '20px',
            overflowY: 'auto',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        {rightAddon && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-[40px] h-[40px] flex items-center justify-center">
            {rightAddon}
          </div>
        )}
      </div>

      <button
        onClick={handleSend}
        disabled={!hasText || disabled}
        className="flex-shrink-0 flex items-center justify-center send-btn"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: hasText ? 'var(--gradient-accent)' : 'var(--bg-input)',
          boxShadow: hasText ? 'var(--shadow-button)' : 'none',
          color: hasText ? 'var(--text-on-accent)' : 'var(--text-muted)',
          border: hasText ? 'none' : '1px solid var(--border-subtle)',
          transition: 'all var(--transition-fast)',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Send size={20} className={hasText ? '' : 'translate-x-[-1px]'} />
        <style>
          {`
            .send-btn:active {
              transform: ${hasText ? 'scale(0.92)' : 'none'};
            }
          `}
        </style>
      </button>
    </div>
  );
};
