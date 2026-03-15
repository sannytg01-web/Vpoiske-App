import React, { useState } from 'react';

export interface HDChartProps {
  definedCenters: string[]; // e.g. ['head', 'ajna', 'throat', 'g', 'heart', 'sacral', 'solar', 'spleen', 'root']
  activeChannels: string[]; // e.g. ['43-23', '20-34']
  onCenterClick?: (centerId: string) => void;
}

const CENTER_POSITIONS = {
  head:   { cx: 50, cy: 10, type: 'triangle-up' },
  ajna:   { cx: 50, cy: 30, type: 'triangle-down' },
  throat: { cx: 50, cy: 50, type: 'square' },
  g:      { cx: 50, cy: 75, type: 'diamond' },
  heart:  { cx: 75, cy: 65, type: 'triangle-down' },
  sacral: { cx: 50, cy: 100, type: 'square' },
  solar:  { cx: 80, cy: 100, type: 'triangle-down' },
  spleen: { cx: 20, cy: 100, type: 'triangle-up' },
  root:   { cx: 50, cy: 130, type: 'square' },
};

const CHANNELS = [
  // Examples, real app needs all 36 channels with exact coordinate mapping
  { id: '43-23', from: 'ajna', to: 'throat' },
  { id: '1-8', from: 'g', to: 'throat' },
  { id: '20-34', from: 'throat', to: 'sacral' },
  { id: '40-37', from: 'heart', to: 'solar' },
  // Root connections
  { id: '53-42', from: 'root', to: 'sacral' },
  { id: '18-58', from: 'root', to: 'spleen' },
];

export const HDChart: React.FC<HDChartProps> = ({ definedCenters, activeChannels, onCenterClick }) => {
  const [hoveredCenter, setHoveredCenter] = useState<string | null>(null);

  const getPathForShape = (cx: number, cy: number, type: string, size = 12) => {
    switch (type) {
      case 'triangle-up': {
        const h = size * 2;
        const R = h * (2/3); // Distance to top point
        const r = h * (1/3); // Distance to base
        return `M ${cx} ${cy - R} L ${cx + size * 1.15} ${cy + r} L ${cx - size * 1.15} ${cy + r} Z`;
      }
      case 'triangle-down': {
        const h = size * 2;
        const R = h * (2/3); // Distance to bottom point
        const r = h * (1/3); // Distance to top base
        return `M ${cx - size * 1.15} ${cy - r} L ${cx + size * 1.15} ${cy - r} L ${cx} ${cy + R} Z`;
      }
      case 'diamond':
        return `M ${cx} ${cy - size} L ${cx + size} ${cy} L ${cx} ${cy + size} L ${cx - size} ${cy} Z`;
      case 'square':
      default:
        return `M ${cx - size} ${cy - size} h ${size*2} v ${size*2} h -${size*2} Z`;
    }
  };

  return (
    <div className="relative w-full aspect-[2/3] max-w-sm mx-auto my-6 p-4">
      <svg
        viewBox="0 0 100 150"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}
      >
        {/* Draw channels (lines) first so they are behind centers */}
        {CHANNELS.map(ch => {
          const from = CENTER_POSITIONS[ch.from as keyof typeof CENTER_POSITIONS];
          const to = CENTER_POSITIONS[ch.to as keyof typeof CENTER_POSITIONS];
          if (!from || !to) return null;

          const isActive = activeChannels.includes(ch.id);
          
          return (
            <line
              key={ch.id}
              x1={from.cx} y1={from.cy}
              x2={to.cx} y2={to.cy}
              className={isActive ? 'hd-channel-active' : 'hd-channel-inactive'}
              style={{
                stroke: isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.10)',
                strokeWidth: isActive ? 2 : 1,
                transition: 'stroke 0.3s ease',
              }}
            />
          );
        })}

        {/* Draw centers */}
        {Object.entries(CENTER_POSITIONS).map(([id, pos]) => {
          const isDefined = definedCenters.includes(id);
          const isHovered = hoveredCenter === id;
          
          return (
            <g
              key={id}
              onClick={() => onCenterClick?.(id)}
              onMouseEnter={() => setHoveredCenter(id)}
              onMouseLeave={() => setHoveredCenter(null)}
              className="cursor-pointer"
            >
              <path
                d={getPathForShape(pos.cx, pos.cy, pos.type)}
                className={isDefined ? 'hd-center-defined' : 'hd-center-undefined'}
                style={{
                  fill: isDefined ? 'var(--accent-primary)' : 'transparent',
                  fillOpacity: isDefined ? 0.85 : 1,
                  stroke: isDefined ? 'var(--text-on-accent)' : 'rgba(255,255,255,0.15)',
                  strokeWidth: isHovered ? 1.5 : 1,
                  transformOrigin: `${pos.cx}px ${pos.cy}px`,
                  transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
