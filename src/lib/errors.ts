export function isOfflineError(cause: unknown) {
  const message = (cause instanceof Error ? cause.message : typeof cause === 'string' ? cause : '').toLowerCase();
  return message.includes('network') || message.includes('fetch') || message.includes('offline');
}

export function offlineMessage(cause: unknown) {
  return isOfflineError(cause) ? "You're offline. Check your connection and try again." : undefined;
}

export function userFacingError(cause: unknown, fallback: string) {
  const message = cause instanceof Error ? cause.message : '';
  if (isOfflineError(cause)) return "You're offline. Check your connection and try again.";
  if (message.startsWith('Add EXPO_PUBLIC_')) return message;
  return fallback;
}
