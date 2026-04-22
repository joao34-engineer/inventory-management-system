declare module 'custom-env' {
  export function env(stage?: string, path?: string): void;
  // Add other functions if you use them, like .env() or .config()
}
