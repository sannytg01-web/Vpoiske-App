import type { Variants } from 'framer-motion';

export const pageTransition: Variants = {
  initial: { opacity: 0, scale: 0.98, y: 8 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { 
      type: "spring", stiffness: 300, damping: 25, mass: 0.8
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.98,
    y: -8, 
    transition: { duration: 0.2, ease: "easeOut" } 
  },
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.95 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.06,
      type: "spring",
      stiffness: 350,
      damping: 25,
      mass: 0.8
    },
  }),
};

export const bubbleVariants: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      type: "spring", stiffness: 400, damping: 25 
    },
  },
};

export const bottomSheetVariants: Variants = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { 
      type: "spring", stiffness: 350, damping: 30, mass: 1 
    },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { 
      duration: 0.25, ease: [0.4, 0, 1, 1] 
    },
  },
};
