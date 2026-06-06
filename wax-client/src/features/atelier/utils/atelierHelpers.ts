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

// Parseo string-based (sin regex) — O(n) garantizado, evita ReDoS.
const SKETCH_OPEN = '<!--sketch:';
const CONFIRM_TAG = '<!--confirm-->';
const MARKER_CLOSE = '-->';

const findSketchBounds = (text: string): { start: number; end: number } | null => {
  const start = text.toLowerCase().indexOf(SKETCH_OPEN);
  if (start === -1) return null;
  const end = text.indexOf(MARKER_CLOSE, start + SKETCH_OPEN.length);
  if (end === -1) return null;
  return { start, end };
};

const findConfirmIndex = (text: string): number => text.toLowerCase().indexOf(CONFIRM_TAG);

export type AtelierMarker =
  | { kind: 'sketch'; prompt: string; description?: string; artStyle?: ArtStyle }
  | { kind: 'confirm' };

// Extrae el primer marcador relevante del mensaje del agente. Hay 2 tipos:
//   <!--SKETCH:[english prompt]|[spanish description]-->  → generar/refinar boceto
//   <!--CONFIRM-->                                         → disparar generación 3D
export const extractAtelierMarker = (text: string): AtelierMarker | null => {
  const sketchBounds = findSketchBounds(text);
  if (sketchBounds) {
    const content = text
      .slice(sketchBounds.start + SKETCH_OPEN.length, sketchBounds.end)
      .trim();
    const parts = content.split('|').map((p) => p.trim());
    const prompt = parts[0] ?? '';
    const description = parts.length >= 2 ? parts[1] : undefined;
    return { kind: 'sketch', prompt, description };
  }
  if (findConfirmIndex(text) !== -1) {
    return { kind: 'confirm' };
  }
  return null;
};

// Quita TODOS los marcadores (SKETCH y CONFIRM) del texto visible al cliente.
export const stripHiddenMarkers = (text: string): string => {
  let result = text;
  // Loop seguro: cada iteración consume al menos los caracteres del marcador
  while (true) {
    const sketchBounds = findSketchBounds(result);
    if (sketchBounds) {
      let realStart = sketchBounds.start;
      while (realStart > 0 && /\s/.test(result[realStart - 1])) realStart--;
      result = result.slice(0, realStart) + result.slice(sketchBounds.end + MARKER_CLOSE.length);
      continue;
    }
    const confirmIdx = findConfirmIndex(result);
    if (confirmIdx !== -1) {
      let realStart = confirmIdx;
      while (realStart > 0 && /\s/.test(result[realStart - 1])) realStart--;
      result = result.slice(0, realStart) + result.slice(confirmIdx + CONFIRM_TAG.length);
      continue;
    }
    break;
  }
  return result.trim();
};

export const getProgressMessage = (progress: number) =>
  ([...PROGRESS_MESSAGES].reverse().find(m => progress >= m.threshold) ?? PROGRESS_MESSAGES[0]).label;

// Siempre pasamos por el proxy /meshy-cdn para evitar CORS:
// - local: lo resuelve el proxy de Vite (vite.config.ts)
// - producción: lo resuelve la Rewrite Rule de Render (/meshy-cdn/* -> https://assets.meshy.ai/*)
export const meshyUrl = (url: string) =>
  url.replace('https://assets.meshy.ai', '/meshy-cdn');
