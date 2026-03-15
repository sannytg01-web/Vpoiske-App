import { detectPlatform } from './platform';
import { tgShowBackButton, tgHideBackButton, tgHaptic } from './telegram';
import { maxShowBackButton, maxHideBackButton, maxHaptic } from './maxBridge';

export const showBackButton = (callback: () => void) => {
  const p = detectPlatform();
  if (p === 'telegram') tgShowBackButton(callback);
  else if (p === 'max') maxShowBackButton(callback);
};

export const hideBackButton = () => {
  const p = detectPlatform();
  if (p === 'telegram') tgHideBackButton();
  else if (p === 'max') maxHideBackButton();
};

export const haptic = (type: 'light' | 'medium' | 'success') => {
  const p = detectPlatform();
  if (p === 'telegram') tgHaptic(type);
  else if (p === 'max') maxHaptic(type);
};
