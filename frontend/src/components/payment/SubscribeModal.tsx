import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { bottomSheetVariants } from '../../utils/animations';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

export interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

export const SubscribeModal: React.FC<SubscribeModalProps> = ({ isOpen, onClose, onSubscribe }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 cursor-pointer"
            style={{
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'var(--blur-modal)',
              WebkitBackdropFilter: 'var(--blur-modal)',
            }}
          />

          {/* Bottom Sheet */}
          <motion.div
            variants={bottomSheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col"
            style={{
              background: 'var(--bg-secondary)',
              borderTopLeftRadius: 'var(--radius-xl)',
              borderTopRightRadius: 'var(--radius-xl)',
              padding: '24px 20px',
              paddingBottom: 'calc(24px + var(--safe-bottom))',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.4)',
              borderTop: '1px solid var(--border-subtle)'
            }}
          >
            {/* Dragger Handle */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-[rgba(255,255,255,0.2)]" />

            <div className="flex w-full items-start justify-between mb-4 mt-2">
              <h2 className="text-h1 text-white m-0">Vpoiske Premium</h2>
              <button 
                onClick={onClose}
                className="p-2 -mr-2 text-white bg-[rgba(255,255,255,0.05)] rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-body text-secondary mb-6">
              Открой полный доступ к анализу совместимости, детальному Human Design 
              и безлимитному общению с AI-проводником.
            </p>

            <ul className="flex flex-col space-y-3 mb-8">
              {['Детальный разбор бодиграфа', 'Процент и график совместимости с мэтчами', 'Безлимитные советы от AI в реальном времени'].map((text, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <CheckCircle2 color="var(--accent-secondary)" size={20} className="mt-[2px] shrink-0" />
                  <span className="text-body text-white">{text}</span>
                </li>
              ))}
            </ul>

            <Button variant="primary" onClick={onSubscribe} className="py-4">
              Оформить за 990 ₽ / мес
            </Button>
            <p className="text-caption text-muted text-center mt-4">
              Отменить можно в любой момент.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
