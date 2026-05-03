export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export type ChatRequest = {
  message: string;
  sessionId: string;
};

export type ChatResponse = {
  output: string;
  sessionId: string;
};

export type GenerateTextRequest = {
  prompt: string;
  artStyle?: string;
};

export type GenerateImageRequest = {
  imageDataUrl: string;
};

export type GenerateResponse = {
  success: boolean;
  taskId: string;
  taskType: 'text' | 'image';
};

export type TaskStatus = {
  success: boolean;
  taskType: 'text' | 'image';
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED';
  progress: number;
  model_urls?: Record<string, string>;
  thumbnail_url?: string;
  error?: string;
};

export const ART_STYLES = [
  { value: 'realistic', label: 'Realista' },
  { value: 'sculpture', label: 'Escultura' },
  { value: 'pbr', label: 'PBR' },
] as const;
export type ArtStyle = (typeof ART_STYLES)[number]['value'];
