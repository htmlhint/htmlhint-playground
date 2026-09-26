/// <reference types="astro/client" />

type PlausibleQueue = ((...args: unknown[]) => void) & { q?: unknown[][] };

declare global {
  interface Window {
    plausible: PlausibleQueue;
  }
}

export {};
