import React from 'react';
import { Home, Timer, Sparkles, Diamond, User } from 'lucide-react';

export interface TabType {
  id: string;
  label: string;
  icon: React.ElementType;
  hasBadge?: boolean;
}

export interface BottomNavProps {
  activeTab: string;
  onTabChange: (id: string) => void;
  showTimer?: boolean; // controls if Timer/Interview tab is shown
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, showTimer = true }) => {
  const tabs: TabType[] = [
    { id: 'home', label: 'Главная', icon: Home },
  ];
  
  if (showTimer) {
    tabs.push({ id: 'interview', label: 'Интервью', icon: Timer });
  }

  tabs.push(
    { id: 'ai', label: 'AI-агент', icon: Sparkles, hasBadge: true },
    { id: 'matches', label: 'Мэтчи', icon: Diamond },
    { id: 'profile', label: 'Профиль', icon: User }
  );

  return (
    <div
      className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-2"
      style={{
        zIndex: 100,
        height: 'calc(72px + var(--safe-bottom))',
        paddingBottom: 'var(--safe-bottom)',
        background: 'rgba(13, 31, 26, 0.4)',
        backdropFilter: 'var(--blur-nav)',
        WebkitBackdropFilter: 'var(--blur-nav)',
        boxShadow: 'var(--shadow-bottom-nav)',
        borderTop: '1px solid var(--border-subtle)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative flex flex-col items-center justify-center w-full h-full pt-1"
            style={{ 
              color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
              transition: 'color var(--transition-normal)'
            }}
          >
            {isActive && (
              <div 
                className="absolute inset-0 m-auto" 
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  zIndex: -1,
                  transform: 'translateY(-2px)'
                }} 
              />
            )}
            
            <div className="relative">
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              {tab.hasBadge && (
                <div 
                  className="absolute"
                  style={{
                    top: '-2px',
                    right: '-2px',
                    width: '6px',
                    height: '6px',
                    background: 'var(--accent-warm)',
                    borderRadius: '50%',
                    boxShadow: '0 0 0 2px var(--bg-primary)'
                  }}
                />
              )}
            </div>
            <span 
              className="text-label mt-1" 
              style={{ fontSize: '10px' }} // Slightly smaller label to fit strictly
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
