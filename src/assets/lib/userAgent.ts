export const isMobile = (userAgent?: string) =>
  /mobi/gi.test(userAgent ?? globalThis.navigator?.userAgent.toLowerCase());

export const isIOS = (userAgent?: string) =>
  /ipad|iphone|ipod/gi.test(userAgent ?? globalThis.navigator?.userAgent);
