import { create } from 'zustand';
import { apiClient } from '../utils/apiClient';

interface PaymentState {
  isChecking: boolean;
  
  subscribe: () => Promise<{ payment_url: string; order_id: string }>;
  checkStatus: (orderId: string) => Promise<{ status: string; is_premium: boolean; premium_until?: string }>;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  isChecking: false,

  subscribe: async () => {
    try {
      const res = await apiClient.post('/payment/subscribe');
      return res.data;
    } catch (e) {
      console.error('Failed to init payment', e);
      throw e;
    }
  },

  checkStatus: async (orderId: string) => {
    set({ isChecking: true });
    try {
      const res = await apiClient.get(`/payment/status/${orderId}`);
      return res.data;
    } catch (e) {
      console.error('Failed to get payment status', e);
      throw e;
    } finally {
      set({ isChecking: false });
    }
  }
}));
