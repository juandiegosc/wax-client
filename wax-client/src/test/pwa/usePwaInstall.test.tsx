import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePwaInstall } from '@/lib/hooks/usePwaInstall';

describe('usePwaInstall', () => {
  let mockMatchMedia: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockMatchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    globalThis.matchMedia = mockMatchMedia;
    Object.defineProperty(globalThis.navigator, 'maxTouchPoints', { value: 0, configurable: true });
    Object.defineProperty(globalThis.navigator, 'userAgent', {
      value: 'Mozilla/5.0 Windows', configurable: true,
    });
  });

  afterEach(() => { vi.restoreAllMocks(); });

  it('arranca con canInstall=false, isInstalled=false, isIOS=false en desktop', () => {
    const { result } = renderHook(() => usePwaInstall());
    expect(result.current.canInstall).toBe(false);
    expect(result.current.isInstalled).toBe(false);
    expect(result.current.isIOS).toBe(false);
  });

  it('detecta isIOS=true cuando el UA contiene iPhone', () => {
    Object.defineProperty(globalThis.navigator, 'userAgent', { value: 'iPhone Safari', configurable: true });
    const { result } = renderHook(() => usePwaInstall());
    expect(result.current.isIOS).toBe(true);
  });

  it('detecta isIOS=true cuando el UA es Mac con maxTouchPoints>1 (iPad)', () => {
    Object.defineProperty(globalThis.navigator, 'userAgent', { value: 'Mozilla Mac OS', configurable: true });
    Object.defineProperty(globalThis.navigator, 'maxTouchPoints', { value: 2, configurable: true });
    const { result } = renderHook(() => usePwaInstall());
    expect(result.current.isIOS).toBe(true);
  });

  it('detecta isInstalled=true cuando display-mode: standalone matches', () => {
    mockMatchMedia.mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    const { result } = renderHook(() => usePwaInstall());
    expect(result.current.isInstalled).toBe(true);
  });

  it('captura el evento beforeinstallprompt y habilita canInstall', () => {
    const { result } = renderHook(() => usePwaInstall());
    const mockEvent = new Event('beforeinstallprompt') as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
    };
    mockEvent.prompt = vi.fn().mockResolvedValue(undefined);
    mockEvent.userChoice = Promise.resolve({ outcome: 'accepted' as const, platform: 'web' });
    act(() => { globalThis.dispatchEvent(mockEvent); });
    expect(result.current.canInstall).toBe(true);
  });

  it('install() llama prompt() y retorna true cuando accepted', async () => {
    const { result } = renderHook(() => usePwaInstall());
    const mockEvent = new Event('beforeinstallprompt') as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
    };
    const promptFn = vi.fn().mockResolvedValue(undefined);
    mockEvent.prompt = promptFn;
    mockEvent.userChoice = Promise.resolve({ outcome: 'accepted' as const, platform: 'web' });
    act(() => { globalThis.dispatchEvent(mockEvent); });
    let accepted = false;
    await act(async () => { accepted = await result.current.install(); });
    expect(promptFn).toHaveBeenCalled();
    expect(accepted).toBe(true);
  });

  it('install() retorna false cuando no hay deferredPrompt', async () => {
    const { result } = renderHook(() => usePwaInstall());
    const accepted = await result.current.install();
    expect(accepted).toBe(false);
  });

  it('escucha appinstalled y marca isInstalled', () => {
    const { result } = renderHook(() => usePwaInstall());
    act(() => { globalThis.dispatchEvent(new Event('appinstalled')); });
    expect(result.current.isInstalled).toBe(true);
  });
});
