export {};

declare global {
  interface Window {
    Telegram?: any;
    __tgBackCb?: any;
    __tgMainCb?: any;
  }
}
