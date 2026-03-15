import React from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';

export interface AgentHeaderProps {
  onBack?: () => void;
}

export const AgentHeader: React.FC<AgentHeaderProps> = ({ onBack }) => {
  return (
    <div 
      className="flex items-center px-4 py-3 sticky top-0 z-50"
      style={{
        background: 'rgba(13, 31, 26, 0.75)',
        backdropFilter: 'var(--blur-nav)',
        WebkitBackdropFilter: 'var(--blur-nav)',
        borderBottom: '1px solid var(--border-subtle)',
        paddingTop: 'calc(12px + var(--safe-top))'
      }}
    >
      {onBack && (
        <button onClick={onBack} className="mr-3 text-white">
          <ArrowLeft size={24} />
        </button>
      )}

      <div 
        className="w-11 h-11 flex-shrink-0 flex items-center justify-center relative"
        style={{
          background: 'var(--gradient-accent)',
          borderRadius: '50%',
          boxShadow: '0 4px 12px rgba(74, 158, 127, 0.3)',
        }}
      >
        <Sparkles size={22} color="white" />
        <div 
          className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0d1f1a]"
          style={{ background: 'var(--accent-secondary)' }}
        />
      </div>

      <div className="ml-3 flex flex-col">
        <h2 className="text-h3 text-white m-0">AI-агент</h2>
        <span className="text-caption text-secondary" style={{ color: 'var(--text-secondary)' }}>
          Твой проводник
        </span>
      </div>
    </div>
  );
};
