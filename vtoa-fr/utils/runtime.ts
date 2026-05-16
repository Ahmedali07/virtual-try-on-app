/**
 * Shared tiny helpers (no React imports) usable from hooks, services, or scripts.
 */

export const isBrowser = (): boolean => typeof window !== "undefined";
