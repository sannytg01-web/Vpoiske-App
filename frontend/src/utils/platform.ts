export type Platform = 'telegram' | 'max' | 'web';

export const detectPlatform = (): Platform => {
  // Check Telegram
  if ((window as any).Telegram?.WebApp?.initData) {
    return 'telegram';
  }
  
  // Check MAX
  // MAX injects window.WebApp or we can check URL/referrer
  if (
    typeof window.WebApp !== 'undefined' || 
    window.location.search.includes('max_app') ||
    document.referrer.includes('max.ru')
  ) {
    return 'max';
  }

  // Fallback to web browser testing
  return 'web';
};

export const getPlatformUserId = (): string | number | null => {
  const platform = detectPlatform();
  if (platform === 'telegram' && (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id) {
    return (window as any).Telegram.WebApp.initDataUnsafe.user.id;
  }
  
  if (platform === 'max' && window.WebApp?.initDataUnsafe?.user?.id) {
    return window.WebApp.initDataUnsafe.user.id;
  }

  return null;
};
