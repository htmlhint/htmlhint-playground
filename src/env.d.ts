/// <reference types="astro/client" />

type PlausibleQueue = ((...args: unknown[]) => void) & { q?: unknown[][] };

declare global {
  interface Window {
    ace: typeof import('ace-builds');
    HTMLHint: typeof import('htmlhint').default;
    plausible: PlausibleQueue;
  }
}

export {};
