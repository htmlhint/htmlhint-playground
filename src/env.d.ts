/// <reference types="astro/client" />

declare global {
  interface Window {
    ace: any;
    HTMLHint: any;
    plausible: any;
  }
}

declare module 'ace-builds';
declare module 'htmlhint';

export {};
