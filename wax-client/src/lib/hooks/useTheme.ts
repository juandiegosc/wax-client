import { useCallback, useState } from 'react';
import { applyTheme, getCurrentTheme, persistTheme, type WaxTheme } from '@/lib/utils/theme';

export const useTheme = () => {
  const [theme, setTheme] = useState<WaxTheme>(getCurrentTheme);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      persistTheme(next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
};
