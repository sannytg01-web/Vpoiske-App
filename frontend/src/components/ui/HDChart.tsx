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
      : "fill-transparent stroke-white/20 stroke-[1.5px] transition-all duration-500";

  // Connections mapping generic connections between nodes
  const genericConnections = [
    { id: "Head-Ajna", path: "M 150,55 L 150,75", c1: "Head", c2: "Ajna" },
    { id: "Ajna-Throat", path: "M 150,115 L 150,135", c1: "Ajna", c2: "Throat" },
    { id: "Throat-G", path: "M 150,165 L 150,195", c1: "Throat", c2: "G" },
    { id: "Throat-Heart", path: "M 165,150 L 195,165", c1: "Throat", c2: "Heart" },
    { id: "Heart-G", path: "M 200,200 L 175,220", c1: "Heart", c2: "G" },
    { id: "G-Sacral", path: "M 150,245 L 150,275", c1: "G", c2: "Sacral" },
    { id: "Sacral-Root", path: "M 150,305 L 150,345", c1: "Sacral", c2: "Root" },
    { id: "Sacral-Spleen", path: "M 135,290 L 95,310", c1: "Sacral", c2: "Spleen" },
    { id: "Sacral-SPlexus", path: "M 165,290 L 205,310", c1: "Sacral", c2: "SolarPlexus" },
    { id: "Heart-SPlexus", path: "M 215,200 L 220,295", c1: "Heart", c2: "SolarPlexus" },
    { id: "G-Spleen", path: "M 125,220 L 80,285", c1: "G", c2: "Spleen" },
    { id: "Root-Spleen", path: "M 135,360 L 80,335", c1: "Root", c2: "Spleen" },
    { id: "Root-SPlexus", path: "M 165,360 L 220,345", c1: "Root", c2: "SolarPlexus" },
    { id: "Spleen-Throat", path: "M 80,285 L 135,160", c1: "Spleen", c2: "Throat" },
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
        {genericConnections.map((conn) => (
          <path
            key={conn.id}
            d={conn.path}
            className={getLineClass(conn.c1, conn.c2)}
            fill="none"
            style={
              isDefined(conn.c1) && isDefined(conn.c2)
                ? { filter: "url(#glow)" }
                : undefined
            }
          />
        ))}

        {/* Centers */}

        {/* Head: Triangle Up */}
        <polygon className={centerClass("Head")} points="150,15 175,55 125,55" />
        {/* Ajna: Triangle Down */}
        <polygon className={centerClass("Ajna")} points="125,75 175,75 150,115" />
        {/* Throat: Square */}
        <rect className={centerClass("Throat")} x="135" y="135" width="30" height="30" rx="6" />
        {/* G-Center: Diamond */}
        <polygon className={centerClass("G")} points="150,195 175,220 150,245 125,220" />
        {/* Heart: Triangle Down */}
        <polygon className={centerClass("Heart")} points="185,160 225,160 205,200" />
        {/* Sacral: Square */}
        <rect className={centerClass("Sacral")} x="135" y="275" width="30" height="30" rx="6" />
        {/* Solar Plexus: Triangle Down */}
        <polygon className={centerClass("SolarPlexus")} points="195,295 245,295 220,345" />
        {/* Spleen: Triangle Up */}
        <polygon className={centerClass("Spleen")} points="80,285 105,335 55,335" />
        {/* Root: Square */}
        <rect className={centerClass("Root")} x="135" y="345" width="30" height="30" rx="6" />
      </svg>
    </div>
  );
};
