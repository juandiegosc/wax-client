import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useChat } from '@/features/atelier/hooks/useChat';
import {
  useGenerateFromText,
  useGenerateFromImage,
  useRefineFromPreview,
} from '@/features/atelier/hooks/useGenerate';
import { useTaskStatus } from '@/features/atelier/hooks/useTaskStatus';

const { mockChat, mockGenText, mockGenImg, mockRefine, mockGetStatus } = vi.hoisted(() => ({
  mockChat: vi.fn(),
  mockGenText: vi.fn(),
  mockGenImg: vi.fn(),
  mockRefine: vi.fn(),
  mockGetStatus: vi.fn(),
}));

vi.mock('@/features/atelier/api/atelierApi', () => ({
  atelierApi: {
    chat: mockChat,
    generateFromText: mockGenText,
    generateFromImage: mockGenImg,
    refineFromPreview: mockRefine,
    getStatus: mockGetStatus,
  },
}));

const wrapper = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe('useChat', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('llama a atelierApi.chat con el request', async () => {
    mockChat.mockResolvedValue({ output: 'response' });
    const { result } = renderHook(() => useChat(), { wrapper: wrapper() });

    const req = { message: 'hola', sessionId: 's1' };
    await act(async () => { result.current.mutate(req); });

    await waitFor(() => expect(mockChat).toHaveBeenCalledWith(req));
    await waitFor(() => expect(result.current.data?.output).toBe('response'));
  });
});

describe('useGenerateFromText', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('llama a atelierApi.generateFromText', async () => {
    mockGenText.mockResolvedValue({ taskId: 't1' });
    const { result } = renderHook(() => useGenerateFromText(), { wrapper: wrapper() });

    const req = { prompt: 'leather bag', artStyle: 'realistic' as const };
    await act(async () => { result.current.mutate(req); });

    await waitFor(() => expect(mockGenText).toHaveBeenCalledWith(req));
  });
});

describe('useGenerateFromImage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('llama a atelierApi.generateFromImage', async () => {
    mockGenImg.mockResolvedValue({ taskId: 't2' });
    const { result } = renderHook(() => useGenerateFromImage(), { wrapper: wrapper() });

    const req = { imageDataUrl: 'data:image/png;base64,abc' };
    await act(async () => { result.current.mutate(req); });

    await waitFor(() => expect(mockGenImg).toHaveBeenCalledWith(req));
  });
});

describe('useRefineFromPreview', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('llama a atelierApi.refineFromPreview con taskId y artStyle', async () => {
    mockRefine.mockResolvedValue({ taskId: 't3' });
    const { result } = renderHook(() => useRefineFromPreview(), { wrapper: wrapper() });

    const req = { previewTaskId: 't1', artStyle: 'realistic' as const };
    await act(async () => { result.current.mutate(req); });

    await waitFor(() => expect(mockRefine).toHaveBeenCalledWith(req));
  });
});

describe('useTaskStatus', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('llama a atelierApi.getStatus con el taskId y taskType', async () => {
    const status = { success: true, taskType: 'text' as const, status: 'IN_PROGRESS' as const, progress: 50 };
    mockGetStatus.mockResolvedValue(status);

    const { result } = renderHook(() => useTaskStatus('t1', 'text'), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.data).toEqual(status));
    expect(mockGetStatus).toHaveBeenCalledWith('t1', 'text');
  });

  it('no fetcha cuando taskId es null', async () => {
    const { result } = renderHook(() => useTaskStatus(null, 'text'), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));
    expect(mockGetStatus).not.toHaveBeenCalled();
  });

  it('para de pollear cuando el status es SUCCEEDED', async () => {
    mockGetStatus.mockResolvedValue({ success: true, taskType: 'text', status: 'SUCCEEDED', progress: 100 });

    const { result } = renderHook(() => useTaskStatus('t1', 'text'), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.data?.status).toBe('SUCCEEDED'));
    // refetchInterval debería devolver false para SUCCEEDED — vemos que no sigue pollando
    expect(mockGetStatus).toHaveBeenCalledTimes(1);
  });
});
