// htmlhint ships type declarations but does not reference them from its
// package.json, so map the UMD bundle's default export to them here.
declare module 'htmlhint' {
  const htmlhint: typeof import('htmlhint/dist/core/core');
  export default htmlhint;
}
