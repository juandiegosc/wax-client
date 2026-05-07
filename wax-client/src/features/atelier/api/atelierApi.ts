import axios from 'axios';
import { env } from '@/config/env';
import type {
  ChatRequest,
  ChatResponse,
  GenerateImageRequest,
  GenerateTextRequest,
  GenerateResponse,
  TaskStatus,
  ArtStyle,
} from '@/features/atelier/types/atelier.types';

export type RefineRequest = { previewTaskId: string; artStyle?: ArtStyle };

const n8n = axios.create({ baseURL: env.n8nUrl });

export const atelierApi = {
  chat: async (req: ChatRequest): Promise<ChatResponse> => {
    const res = await n8n.post<ChatResponse>('/meshy-chat', req);
    return res.data;
  },

  generateFromText: async (req: GenerateTextRequest): Promise<GenerateResponse> => {
    const res = await n8n.post<GenerateResponse>('/meshy-generate', req);
    return res.data;
  },

  generateFromImage: async (req: GenerateImageRequest): Promise<GenerateResponse> => {
    const res = await n8n.post<GenerateResponse>('/meshy-generate-image', req);
    return res.data;
  },

  submitCotizacion: async (req: { glbUrl: string; taskId: string; description: string }): Promise<void> => {
    await n8n.post('/meshy-cotizar', req);
  },

  refineFromPreview: async (req: RefineRequest): Promise<GenerateResponse> => {
    const res = await n8n.post<GenerateResponse>('/meshy-refine', req);
    return res.data;
  },

  getStatus: async (taskId: string, taskType: 'text' | 'refine' | 'image'): Promise<TaskStatus> => {
    const path = taskType === 'image' ? '/meshy-status-image' : '/meshy-status';
    const res = await n8n.post<TaskStatus>(path, { taskId });
    return res.data;
  },
};
