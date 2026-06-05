import { useEffect, useState, useCallback } from 'react';

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
  if (globalThis.window === undefined) return false;
  if (globalThis.matchMedia('(display-mode: standalone)').matches) return true;
  if ('standalone' in globalThis.navigator && (globalThis.navigator as { standalone?: boolean }).standalone) return true;
  return false;
};

export type PwaInstallState = {
  isInstalled: boolean;
  canInstall: boolean;
  isIOS: boolean;
  install: () => Promise<boolean>;
};

export const usePwaInstall = (): PwaInstallState => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(() => isStandalone());

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    globalThis.addEventListener('beforeinstallprompt', onBeforeInstall);
    globalThis.addEventListener('appinstalled', onInstalled);
    return () => {
      globalThis.removeEventListener('beforeinstallprompt', onBeforeInstall);
      globalThis.removeEventListener('appinstalled', onInstalled);
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
