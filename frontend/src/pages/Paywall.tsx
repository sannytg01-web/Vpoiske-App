import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Diamond, CheckCircle } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { useAuthStore } from "../store/authStore";
import { usePaymentStore } from "../store/paymentStore";

const bottomSheetVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, damping: 25, stiffness: 200 },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { type: "tween" as const, duration: 0.3 },
  },
};

export const Paywall: React.FC = () => {
  const navigate = useNavigate();
  const setPremium = useAuthStore((s) => s.setPremium);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      if ((window as any).Telegram?.WebApp?.HapticFeedback) {
        (window as any).Telegram.WebApp.HapticFeedback.impactOccurred("medium");
      }

      const { payment_url, order_id } = await usePaymentStore.getState().subscribe();
      
      if ((window as any).Telegram?.WebApp?.openLink) {
        (window as any).Telegram.WebApp.openLink(payment_url);
      } else {
        window.open(payment_url, '_blank');
      }

      // Polling for status
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        if (attempts > 150) {
          clearInterval(poll);
          setError("Оплата не подтверждена за отведенное время");
          setLoading(false);
          return;
        }

        try {
            const statusRes = await usePaymentStore.getState().checkStatus(order_id);
            if (statusRes.is_premium) {
                clearInterval(poll);
                if ((window as any).Telegram?.WebApp?.HapticFeedback) {
                    (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred("success");
                }
                setPremium(true, statusRes.premium_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
                navigate(-1);
            } else if (statusRes.status === 'failed') {
                clearInterval(poll);
                setError("Ошибка оплаты");
                setLoading(false);
            }
        } catch (e) {
             // Ignoring temporary fetch errors during polling
        }
      }, 5000); // Check every 5s
    } catch (e) {
      console.error(e);
      setError("Ошибка сети. Попробуйте снова.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <motion.div
        className="absolute inset-0 bg-[#0d1f1a]/70 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => navigate(-1)}
      />

      <motion.div
        variants={bottomSheetVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative w-full bg-[#112721] rounded-t-[32px] border-t border-white/10 p-6 pb-[calc(24px+var(--safe-bottom,20px))] shadow-[0_-20px_40px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />

        <div className="flex flex-col items-center text-center">
          <Diamond
            size={36}
            className="text-accent-warm mb-4"
            fill="currentColor"
          />
          <h2 className="text-h2 text-white mb-2">Влюбви Premium</h2>
          <p className="text-body text-secondary mb-8 max-w-[250px]">
            Открой всех, с кем ты совпадаешь
          </p>
        </div>

        <div className="space-y-4 mb-8 max-w-sm mx-auto">
          {[
            "Все мэтчи без ограничений",
            "Подробная психологическая совместимость",
            "Начать общение с любым мэтчем",
            "Первым видеть новые совпадения",
          ].map((feature, i) => (
            <div key={i} className="flex items-center space-x-3">
              <CheckCircle size={16} className="text-accent-primary shrink-0" />
              <span className="text-body text-white font-medium">
                {feature}
              </span>
            </div>
          ))}
        </div>

        <GlassCard className="p-4 flex flex-col items-center justify-center text-center mb-6 border-accent-warm/20 bg-accent-warm/5 max-w-sm mx-auto">
          <h1 className="text-h1 text-white m-0 tracking-tight">490 ₽</h1>
          <p className="text-body text-secondary m-0 mt-1">
            в месяц · Отмена в любой момент
          </p>
        </GlassCard>

        {error && (
          <GlassCard className="p-3 mb-4 bg-accent-warning/10 border-accent-warning/20 max-w-sm mx-auto">
            <p className="text-caption text-accent-warning text-center m-0">
              {error}
            </p>
          </GlassCard>
        )}

        <div className="max-w-sm mx-auto">
          <Button
            variant="primary"
            className="w-full text-[16px] shadow-[0_0_20px_rgba(229,176,121,0.2)]"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? "Ожидание оплаты..." : "Оформить подписку"}
          </Button>
        </div>

        <p className="text-[10px] text-center text-white/40 mt-4 leading-relaxed max-w-[280px] mx-auto">
          Оплата через T-Bank · Данные защищены · 152-ФЗ
        </p>
      </motion.div>
    </div>
  );
};
