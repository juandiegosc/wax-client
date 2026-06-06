import axios from 'axios';
import { env } from '@/config/env';

// Sin interceptor de navegación: un 500 no debe redirigir al usuario.
const silentApi = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
});
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

export type DesignFields = {
  type: string;
  material: string;
  color: string;
  shape: string;
  dimensions: string;
  details?: string;
};

export type AnalyzeImageResponse = {
  received: boolean;
  design: DesignFields;
};

export type SubmitCotizacionDirectRequest = {
  taskId: string;
  glbUrl: string;
  rawDescription: string;
  design: DesignFields;
};

const n8n = axios.create({ baseURL: env.n8nUrl });

const sanitizeDesign = (design: DesignFields | null | undefined): DesignFields => ({
  type: (design?.type ?? '').slice(0, 100),
  material: (design?.material ?? '').slice(0, 100),
  color: (design?.color ?? '').slice(0, 50),
  shape: (design?.shape ?? '').slice(0, 50),
  dimensions: (design?.dimensions ?? '').replaceAll('×', 'x').slice(0, 50),
  details: (design?.details ?? '').slice(0, 490),
});

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
    type N8nCotizarResponse = {
      taskId: string;
      glbUrl: string;
      rawDescription: string;
      design: DesignFields;
    };

    const n8nRes = await n8n.post<N8nCotizarResponse>('/meshy-cotizar', req);
    const { taskId, glbUrl, rawDescription, design } = n8nRes.data;

    const payload = {
      taskId,
      glbUrl,
      rawDescription: rawDescription.slice(0, 990),
      design: sanitizeDesign(design),
    };

    await silentApi.post('/CustomProduct', payload);
  },

  analyzeImage: async (imageDataUrl: string): Promise<DesignFields> => {
    const res = await n8n.post<AnalyzeImageResponse>('/meshy-analyze-image', { imageDataUrl });
    return res.data.design;
  },

  generateSketch: async (prompt: string): Promise<string> => {
    const res = await n8n.post<{ success: boolean; imageUrl: string }>('/meshy-sketch', { prompt });
    return res.data.imageUrl;
  },

  submitCotizacionDirect: async (req: SubmitCotizacionDirectRequest): Promise<void> => {
    const payload = {
      taskId: req.taskId,
      glbUrl: req.glbUrl,
      rawDescription: req.rawDescription.slice(0, 990),
      design: sanitizeDesign(req.design),
    };
    await silentApi.post('/CustomProduct', payload);
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
