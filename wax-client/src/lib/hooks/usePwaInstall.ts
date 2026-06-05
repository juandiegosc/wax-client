import { useEffect, useState, useCallback } from 'react';

// Event que dispara Chrome/Edge/Android cuando la PWA es instalable.
// No esta en el lib oficial de TS asi que lo tipamos a mano.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const isIOSDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  if (/iPhone|iPod|iPad/.test(ua)) return true;
  if (ua.includes('Mac') && navigator.maxTouchPoints > 1) return true;
  return false;
};

const isStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  // Chrome/Android usan display-mode standalone; iOS usa navigator.standalone
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  if ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone) return true;
  return false;
};

export type PwaInstallState = {
  /** Si la PWA ya esta instalada / abierta como app, no mostrar el boton */
  isInstalled: boolean;
  /** Si podemos disparar el prompt nativo (Chrome/Android principalmente) */
  canInstall: boolean;
  /** Si el cliente esta en iOS Safari (sin prompt nativo, requiere instrucciones manuales) */
  isIOS: boolean;
  /** Dispara el prompt nativo de instalacion. Devuelve true si el cliente acepto */
  install: () => Promise<boolean>;
};

export const usePwaInstall = (): PwaInstallState => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(() => isStandalone());

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      // Evita que Chrome muestre el mini-infobar automatico
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return choice.outcome === 'accepted';
  }, [deferredPrompt]);

  return {
    isInstalled: installed,
    canInstall: deferredPrompt !== null,
    isIOS: isIOSDevice(),
    install,
  };
};
