// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
/// <reference types="svelte" />
/// <reference types="vite/client" />

declare namespace App {
  // interface Locals {}
  // interface Platform {}
  // interface PrivateEnv {}
  // interface PublicEnv {}
}

declare module '*.png?url' {
  const src: string;
  export default src;
}
