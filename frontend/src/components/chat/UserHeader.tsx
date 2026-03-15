import React from 'react';
import { ChevronLeft } from 'lucide-react';

export interface UserHeaderProps {
  name: string;
  status?: string;
  photoUrl?: string;
  onBack?: () => void;
}

export const UserHeader: React.FC<UserHeaderProps> = ({ name, status = 'Онлайн', photoUrl, onBack }) => {
  return (
    <div 
      className="flex items-center px-4 py-3 sticky top-0 z-50"
      style={{
        background: 'rgba(13, 31, 26, 0.75)',
        backdropFilter: 'var(--blur-nav)',
        borderBottom: '1px solid var(--border-subtle)',
        paddingTop: 'calc(12px + var(--safe-top))'
      }}
    >
      {onBack && (
        <button onClick={onBack} className="mr-3 text-white">
          <ChevronLeft size={28} />
        </button>
      )}

      <div className="w-10 h-10 flex-shrink-0 relative">
        <img 
          src={photoUrl || 'https://via.placeholder.com/40'} 
          alt={name} 
          className="w-full h-full object-cover rounded-full"
        />
        <div 
          className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0d1f1a]"
          style={{ background: 'var(--accent-secondary)' }}
        />
      </div>

      <div className="ml-3 flex flex-col">
        <h2 className="text-h3 text-white m-0 truncate max-w-[200px]">{name}</h2>
        <span className="text-caption text-accent-secondary" style={{ color: 'var(--accent-secondary)' }}>
          {status}
        </span>
      </div>
    </div>
  );
};
