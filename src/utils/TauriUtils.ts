/**
 * Tauri utility functions
 */

/**
 * Checks if the app is running inside Tauri desktop environment
 */
export function isTauri(): boolean {
  return '__TAURI__' in window;
}

/**
 * Alias for isTauri()
 */
export const isDesktop = isTauri;

/**
 * Checks if running in web browser
 */
export function isWeb(): boolean {
  return !isTauri();
}

/**
 * Gets the current platform (tauri or web)
 */
export function getPlatform(): 'tauri' | 'web' {
  return isTauri() ? 'tauri' : 'web';
}
