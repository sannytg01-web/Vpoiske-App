// MAX Web App Global Declarations based on CDN script
declare global {
  interface Window {
    WebApp?: {
      ready: () => void;
      close: () => void;
      requestContact: (callback: (contact: any) => void) => void;
      openLink: (url: string) => void;
      openMaxLink: (url: string) => void;
      shareContent: (options: any) => void;
      enableClosingConfirmation: () => void;
      initDataUnsafe?: { user?: { id?: number | string } };
      BackButton: {
        show: () => void;
        hide: () => void;
        onClick: (cb: () => void) => void;
        offClick: (cb: () => void) => void;
      };
      HapticFeedback: {
        impactOccurred: (style: 'light'|'medium'|'heavy'|'rigid'|'soft') => void;
        notificationOccurred: (type: 'error'|'success'|'warning') => void;
        selectionChanged: () => void;
      };
      ScreenCapture: {
        enable: () => void;
        disable: () => void;
      };
      onEvent: (event: string, callback: Function) => void;
      offEvent: (event: string, callback: Function) => void;
    };
  }
}

export const initMax = () => {
  if (window.WebApp) {
    window.WebApp.ready();
    try {
      // Disable screenshots if it's sensitive
      window.WebApp.ScreenCapture?.disable();
    } catch(e) { console.error(e); }
  }
};

export const maxShowBackButton = (callback: () => void) => {
  if (window.WebApp?.BackButton) {
    window.WebApp.BackButton.show();
    window.WebApp.BackButton.onClick(callback);
    (window as any).__maxBackCb = callback;
  }
};

export const maxHideBackButton = () => {
  if (window.WebApp?.BackButton) {
    window.WebApp.BackButton.hide();
    const cb = (window as any).__maxBackCb;
    if (cb) window.WebApp.BackButton.offClick(cb);
  }
};

export const maxHaptic = (type: 'light' | 'medium' | 'success') => {
  if (!window.WebApp?.HapticFeedback) return;
  if (type === 'success') {
    window.WebApp.HapticFeedback.notificationOccurred('success');
  } else {
    window.WebApp.HapticFeedback.impactOccurred(type === 'medium' ? 'medium' : 'light');
  }
};

export const maxRequestPhone = (onResult: (contact: any) => void) => {
  if (window.WebApp?.requestContact) {
    window.WebApp.requestContact(onResult);
  }
};
