import React from "react";
import { motion } from "framer-motion";

export interface HDChartProps {
  definedCenters: string[];
  activeChannels: [number, number][]; // Not strictly used for exact drawing in this simplified aesthetic version
}

export const HDChart: React.FC<HDChartProps> = ({ definedCenters }) => {
  const isDefined = (key: string) => definedCenters.includes(key);

  const centerClass = (key: string) =>
    isDefined(key)
      ? "fill-[#4A9E7F] opacity-90 transition-all duration-500 stroke-[#7bc4a0] stroke-[2px]"
      : "fill-[#142920] stroke-white/20 stroke-[1.5px] transition-all duration-500";

  // True logical centers for perfectly straight beautiful lines
  const centers = {
    Head: { x: 150, y: 35 },
    Ajna: { x: 150, y: 95 },
    Throat: { x: 150, y: 155 },
    Heart: { x: 210, y: 175 },
    G: { x: 150, y: 220 },
    Sacral: { x: 150, y: 290 },
    Spleen: { x: 80, y: 290 },
    SolarPlexus: { x: 220, y: 290 },
    Root: { x: 150, y: 360 },
  };

  const genericConnections = [
    { id: "Head-Ajna", c1: "Head", c2: "Ajna" },
    { id: "Ajna-Throat", c1: "Ajna", c2: "Throat" },
    { id: "Throat-G", c1: "Throat", c2: "G" },
    { id: "Throat-Heart", c1: "Throat", c2: "Heart" },
    { id: "Heart-G", c1: "Heart", c2: "G" },
    { id: "G-Sacral", c1: "G", c2: "Sacral" },
    { id: "Sacral-Root", c1: "Sacral", c2: "Root" },
    { id: "Sacral-Spleen", c1: "Sacral", c2: "Spleen" },
    { id: "Sacral-SPlexus", c1: "Sacral", c2: "SolarPlexus" },
    { id: "Heart-SPlexus", c1: "Heart", c2: "SolarPlexus" },
    { id: "G-Spleen", c1: "G", c2: "Spleen" },
    { id: "Root-Spleen", c1: "Root", c2: "Spleen" },
    { id: "Root-SPlexus", c1: "Root", c2: "SolarPlexus" },
    { id: "Spleen-Throat", c1: "Spleen", c2: "Throat" },
  ];

  const getLineClass = (c1: string, c2: string) => {
    if (isDefined(c1) && isDefined(c2)) {
      return "stroke-[#c4956a] stroke-[4px] opacity-80";
    } else if (isDefined(c1) || isDefined(c2)) {
      return "stroke-[#c4956a] stroke-[2px] opacity-40 stroke-dasharray-[4,4]";
    }
    return "stroke-white/10 stroke-[2px]";
  };

  return (
    <div className="w-full aspect-square bg-[#142920]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-4 relative overflow-hidden flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      {/* Background glow behind chart */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="w-[200px] h-[200px] rounded-full bg-[#4A9E7F]/30 blur-[60px]"
        />
      </div>

      <svg
        viewBox="0 0 300 400"
        className="w-full h-full drop-shadow-[0_0_10px_rgba(74,158,127,0.3)] z-10 overflow-visible"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Lines */}
        {genericConnections.map((conn) => {
          const p1 = centers[conn.c1 as keyof typeof centers];
          const p2 = centers[conn.c2 as keyof typeof centers];
          return (
            <line
              key={conn.id}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              className={getLineClass(conn.c1, conn.c2)}
              style={
                isDefined(conn.c1) && isDefined(conn.c2)
                  ? { filter: "url(#glow)" }
                  : undefined
              }
            />
          );
        })}

        {/* Centers */}
        {/* Head: Triangle Up */}
        <polygon className={centerClass("Head")} points="150,15 174,45 126,45" />
        {/* Ajna: Triangle Down */}
        <polygon className={centerClass("Ajna")} points="126,85 174,85 150,115" />
        {/* Throat: Square */}
        <rect className={centerClass("Throat")} x="135" y="140" width="30" height="30" rx="6" />
        {/* G-Center: Diamond */}
        <polygon className={centerClass("G")} points="150,195 175,220 150,245 125,220" />
        {/* Heart: Triangle Down */}
        <polygon className={centerClass("Heart")} points="190,165 230,165 210,195" />
        {/* Sacral: Square */}
        <rect className={centerClass("Sacral")} x="135" y="275" width="30" height="30" rx="6" />
        {/* Solar Plexus: Triangle Left */}
        <polygon className={centerClass("SolarPlexus")} points="235,265 235,315 190,290" />
        {/* Spleen: Triangle Right */}
        <polygon className={centerClass("Spleen")} points="65,265 65,315 110,290" />
        {/* Root: Square */}
        <rect className={centerClass("Root")} x="135" y="345" width="30" height="30" rx="6" />
      </svg>
    </div>
  );
};
