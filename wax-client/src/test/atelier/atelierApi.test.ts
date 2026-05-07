import { describe, it, expect, vi, beforeEach } from 'vitest';
import { atelierApi } from '@/features/atelier/api/atelierApi';

const { mockPost } = vi.hoisted(() => ({ mockPost: vi.fn() }));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({ post: mockPost })),
  },
}));

describe('atelierApi', () => {
  beforeEach(() => {
    mockPost.mockReset();
  });

  describe('chat', () => {
    it('llama a /meshy-chat y devuelve la respuesta', async () => {
      const fakeResponse = { output: 'Hola, cuéntame tu diseño.' };
      mockPost.mockResolvedValue({ data: fakeResponse });

      const result = await atelierApi.chat({ message: 'hola', sessionId: 'abc' });

      expect(mockPost).toHaveBeenCalledWith('/meshy-chat', { message: 'hola', sessionId: 'abc' });
      expect(result).toEqual(fakeResponse);
    });
  });

  describe('generateFromText', () => {
    it('llama a /meshy-generate y devuelve el taskId', async () => {
      mockPost.mockResolvedValue({ data: { taskId: 'task-001' } });

      const result = await atelierApi.generateFromText({
        prompt: 'a black leather bag',
        artStyle: 'realistic',
      });

      expect(mockPost).toHaveBeenCalledWith('/meshy-generate', {
        prompt: 'a black leather bag',
        artStyle: 'realistic',
      });
      expect(result.taskId).toBe('task-001');
    });
  });

  describe('generateFromImage', () => {
    it('llama a /meshy-generate-image con el dataUrl', async () => {
      mockPost.mockResolvedValue({ data: { taskId: 'task-img-001' } });

      const result = await atelierApi.generateFromImage({ imageDataUrl: 'data:image/png;base64,abc' });

      expect(mockPost).toHaveBeenCalledWith('/meshy-generate-image', {
        imageDataUrl: 'data:image/png;base64,abc',
      });
      expect(result.taskId).toBe('task-img-001');
    });
  });

  describe('refineFromPreview', () => {
    it('llama a /meshy-refine con previewTaskId y artStyle', async () => {
      mockPost.mockResolvedValue({ data: { taskId: 'task-refine-001' } });

      const result = await atelierApi.refineFromPreview({
        previewTaskId: 'task-001',
        artStyle: 'realistic',
      });

      expect(mockPost).toHaveBeenCalledWith('/meshy-refine', {
        previewTaskId: 'task-001',
        artStyle: 'realistic',
      });
      expect(result.taskId).toBe('task-refine-001');
    });

    it('funciona sin artStyle (campo opcional)', async () => {
      mockPost.mockResolvedValue({ data: { taskId: 'task-002' } });

      await atelierApi.refineFromPreview({ previewTaskId: 'task-001' });

      expect(mockPost).toHaveBeenCalledWith('/meshy-refine', { previewTaskId: 'task-001' });
    });
  });

  describe('getStatus', () => {
    it('llama a /meshy-status para tipo text', async () => {
      mockPost.mockResolvedValue({ data: { status: 'SUCCEEDED', progress: 100 } });

      const result = await atelierApi.getStatus('task-001', 'text');

      expect(mockPost).toHaveBeenCalledWith('/meshy-status', { taskId: 'task-001' });
      expect(result.status).toBe('SUCCEEDED');
    });

    it('llama a /meshy-status para tipo refine', async () => {
      mockPost.mockResolvedValue({ data: { status: 'PENDING', progress: 30 } });

      await atelierApi.getStatus('task-refine-001', 'refine');

      expect(mockPost).toHaveBeenCalledWith('/meshy-status', { taskId: 'task-refine-001' });
    });

    it('llama a /meshy-status-image para tipo image', async () => {
      mockPost.mockResolvedValue({ data: { status: 'IN_PROGRESS', progress: 50 } });

      await atelierApi.getStatus('task-img-001', 'image');

      expect(mockPost).toHaveBeenCalledWith('/meshy-status-image', { taskId: 'task-img-001' });
    });
  });

  describe('submitCotizacion', () => {
    it('llama a /meshy-cotizar con los tres campos requeridos', async () => {
      mockPost.mockResolvedValue({ data: {} });

      await atelierApi.submitCotizacion({
        glbUrl: 'https://assets.meshy.ai/model.glb',
        taskId: 'task-001',
        description: 'Clutch negro en cuero, 25x15cm',
      });

      expect(mockPost).toHaveBeenCalledWith('/meshy-cotizar', {
        glbUrl: 'https://assets.meshy.ai/model.glb',
        taskId: 'task-001',
        description: 'Clutch negro en cuero, 25x15cm',
      });
    });
  });
});
