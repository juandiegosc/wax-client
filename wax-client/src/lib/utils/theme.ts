export type WaxTheme = 'light' | 'dark';

const STORAGE_KEY = 'wax-theme';

// Preferencia guardada > default por viewport (mobile dark, desktop light)
export const resolveInitialTheme = (): WaxTheme => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage bloqueado (modo privado): cae al default
  }
  return globalThis.matchMedia?.('(max-width: 768px)').matches ? 'dark' : 'light';
};

export const applyTheme = (theme: WaxTheme): void => {
  document.documentElement.dataset.theme = theme;
};

export const persistTheme = (theme: WaxTheme): void => {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // sin persistencia disponible; el tema vive solo en la sesión
  }
};

export const getCurrentTheme = (): WaxTheme =>
  document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
