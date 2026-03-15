import WebApp from "@twa-dev/sdk";

export const initTelegram = () => {
  const tg = (window as any).Telegram?.WebApp;
  if (tg) {
    if (typeof tg.ready === 'function') tg.ready();
    if (typeof tg.expand === 'function') tg.expand();
    try {
      if (typeof tg.setHeaderColor === 'function') tg.setHeaderColor("#0d1f1a");
      if (typeof tg.setBackgroundColor === 'function') tg.setBackgroundColor("#0d1f1a");
    } catch (e) {
      // Ignored for older clients
    }
  }
};

export const tgShowBackButton = (callback: () => void) => {
  if ((window as any).Telegram?.WebApp) {
    WebApp.BackButton.show();
    WebApp.BackButton.onClick(callback);
    // Track current callback on window to remove later if needed
    (window as any).__tgBackCb = callback;
  }
};

export const tgHideBackButton = () => {
  if ((window as any).Telegram?.WebApp) {
    WebApp.BackButton.hide();
    const cb = (window as any).__tgBackCb;
    if (cb) WebApp.BackButton.offClick(cb);
  }
};

export const tgShowMainButton = (text: string, callback: () => void) => {
  if ((window as any).Telegram?.WebApp) {
    WebApp.MainButton.setText(text);
    WebApp.MainButton.show();
    WebApp.MainButton.onClick(callback);
    (window as any).__tgMainCb = callback;
  }
};

export const tgHideMainButton = () => {
  if ((window as any).Telegram?.WebApp) {
    WebApp.MainButton.hide();
    const cb = (window as any).__tgMainCb;
    if (cb) WebApp.MainButton.offClick(cb);
  }
};

export const tgHaptic = (type: "light" | "medium" | "success") => {
  if (!(window as any).Telegram?.WebApp) return;
  if (type === "success") {
    WebApp.HapticFeedback.notificationOccurred("success");
  } else {
    WebApp.HapticFeedback.impactOccurred(
      type === "medium" ? "medium" : "light",
    );
  }
};

export const tgAlert = (msg: string) => {
  try {
    if ((window as any).Telegram?.WebApp?.initDataUnsafe?.query_id || (window as any).Telegram?.WebApp?.platform !== 'unknown') {
      WebApp.showAlert(msg);
    } else {
      window.alert(msg);
    }
  } catch (e) {
    window.alert(msg);
  }
};
