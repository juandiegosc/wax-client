import type { ArtStyle } from '@/features/atelier/types/atelier.types';

const AFFIRMATIVES = new Set([
  'sí', 'si', 'yes', 'ok', 'dale', 'claro', 'hazlo', 'genéralo', 'generalo',
  'genera', 'generar', 'perfecto', 'adelante', 'va', 'listo', 'venga',
  'órale', 'orale', 'ándale', 'andale', 'sip', 'yep', 'sure',
]);

const PROGRESS_MESSAGES = [
  { threshold: 0,  label: 'Analizando el concepto…' },
  { threshold: 15, label: 'Construyendo geometría…' },
  { threshold: 35, label: 'Añadiendo detalles…' },
  { threshold: 55, label: 'Aplicando texturas…' },
  { threshold: 75, label: 'Optimizando el mesh…' },
  { threshold: 90, label: 'Finalizando…' },
];

export const isAffirmative = (text: string) =>
  AFFIRMATIVES.has(text.toLowerCase().trim().replaceAll(/[!¡.¿?]/g, ''));

export const extractMeshyPrompt = (text: string): { prompt: string; artStyle?: ArtStyle } | null => {
  const match = /<!--PROMPT:([\s\S]*?)-->/i.exec(text);
  if (!match) return null;
  const content = match[1].trim();
  const pipeIdx = content.indexOf('|');
  // WAX solo genera en realista: ignoramos cualquier estilo que sugiera la IA
  // y dejamos que el valor por defecto ('realistic') se aplique aguas abajo.
  const prompt = pipeIdx === -1 ? content : content.slice(pipeIdx + 1).trim();
  return { prompt };
};

export const stripHiddenPrompt = (text: string): string =>
  text.replaceAll(/\s*<!--PROMPT:[\s\S]*?-->/gi, '').trim();

export const getProgressMessage = (progress: number) =>
  ([...PROGRESS_MESSAGES].reverse().find(m => progress >= m.threshold) ?? PROGRESS_MESSAGES[0]).label;

// Siempre pasamos por el proxy /meshy-cdn para evitar CORS:
// - local: lo resuelve el proxy de Vite (vite.config.ts)
// - producción: lo resuelve la Rewrite Rule de Render (/meshy-cdn/* -> https://assets.meshy.ai/*)
export const meshyUrl = (url: string) =>
  url.replace('https://assets.meshy.ai', '/meshy-cdn');
