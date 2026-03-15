import React from "react";
import { motion } from "framer-motion";

export const AppBackground: React.FC = () => {
  return (
    <>
      <div
        className="fixed inset-0"
        style={{
          background: "var(--gradient-main)",
          zIndex: -1,
        }}
      />

      {/* Dynamic Background Blobs */}
      <div
        className="fixed inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: -1 }}
      >
        <motion.div
          className="absolute rounded-full mix-blend-screen opacity-60"
          style={{
            background: "var(--accent-primary)",
            filter: "blur(80px)",
            width: "400px",
            height: "400px",
            top: "-10%",
            left: "-20%",
          }}
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 40, -10, 0],
            y: [0, 30, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute rounded-full mix-blend-screen opacity-50"
          style={{
            background: "var(--accent-warm)",
            filter: "blur(90px)",
            width: "350px",
            height: "350px",
            bottom: "10%",
            right: "-10%",
          }}
          animate={{
            scale: [1, 1.25, 1],
            x: [0, -30, 20, 0],
            y: [0, -40, 10, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>
    </>
  );
};
