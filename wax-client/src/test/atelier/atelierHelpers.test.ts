import { describe, it, expect } from 'vitest';
import {
  isAffirmative,
  extractMeshyPrompt,
  stripHiddenPrompt,
  getProgressMessage,
} from '@/features/atelier/utils/atelierHelpers';

// ── isAffirmative ─────────────────────────────────────────────────────────────
describe('isAffirmative', () => {
  it('reconoce afirmativos comunes en español', () => {
    expect(isAffirmative('sí')).toBe(true);
    expect(isAffirmative('dale')).toBe(true);
    expect(isAffirmative('claro')).toBe(true);
    expect(isAffirmative('listo')).toBe(true);
    expect(isAffirmative('perfecto')).toBe(true);
  });

  it('reconoce afirmativos en inglés', () => {
    expect(isAffirmative('yes')).toBe(true);
    expect(isAffirmative('ok')).toBe(true);
    expect(isAffirmative('sure')).toBe(true);
  });

  it('ignora puntuación y espacios', () => {
    expect(isAffirmative('  ¡sí!  ')).toBe(true);
    expect(isAffirmative('ok.')).toBe(true);
    expect(isAffirmative('¿dale?')).toBe(true);
  });

  it('es case-insensitive', () => {
    expect(isAffirmative('SÍ')).toBe(true);
    expect(isAffirmative('OK')).toBe(true);
    expect(isAffirmative('Dale')).toBe(true);
  });

  it('rechaza respuestas negativas o neutras', () => {
    expect(isAffirmative('no')).toBe(false);
    expect(isAffirmative('tal vez')).toBe(false);
    expect(isAffirmative('quiero una bolsa')).toBe(false);
    expect(isAffirmative('')).toBe(false);
  });
});

// ── extractMeshyPrompt ────────────────────────────────────────────────────────
describe('extractMeshyPrompt', () => {
  it('extrae prompt sin art style', () => {
    const result = extractMeshyPrompt('Texto <!--PROMPT:a leather handbag-->');
    expect(result).toEqual({ prompt: 'a leather handbag', artStyle: undefined });
  });

  it('extrae prompt con art style realistic', () => {
    const result = extractMeshyPrompt('<!--PROMPT:realistic|a black leather clutch bag-->');
    expect(result).toEqual({ prompt: 'a black leather clutch bag', artStyle: 'realistic' });
  });

  it('extrae prompt con art style sculpture', () => {
    const result = extractMeshyPrompt('<!--PROMPT:sculpture|minimalist marble vase-->');
    expect(result).toEqual({ prompt: 'minimalist marble vase', artStyle: 'sculpture' });
  });

  it('extrae prompt con art style pbr', () => {
    const result = extractMeshyPrompt('<!--PROMPT:pbr|silver ring with gems-->');
    expect(result).toEqual({ prompt: 'silver ring with gems', artStyle: 'pbr' });
  });

  it('ignora art style desconocido y lo deja como undefined', () => {
    const result = extractMeshyPrompt('<!--PROMPT:watercolor|a bag-->');
    expect(result).toEqual({ prompt: 'a bag', artStyle: undefined });
  });

  it('devuelve null si no hay marcador', () => {
    expect(extractMeshyPrompt('Texto normal sin marcador')).toBeNull();
  });

  it('es case-insensitive en el tag', () => {
    const result = extractMeshyPrompt('<!--prompt:realistic|a belt-->');
    expect(result?.prompt).toBe('a belt');
    expect(result?.artStyle).toBe('realistic');
  });

  it('funciona con marcador en medio del texto', () => {
    const result = extractMeshyPrompt(
      '¡Perfecto! Voy a generarlo ahora. <!--PROMPT:realistic|white leather tote bag, 30x25cm--> ¿Te parece bien?'
    );
    expect(result?.prompt).toBe('white leather tote bag, 30x25cm');
  });
});

// ── stripHiddenPrompt ─────────────────────────────────────────────────────────
describe('stripHiddenPrompt', () => {
  it('elimina el marcador del texto', () => {
    const input = '¡Perfecto! <!--PROMPT:realistic|a bag--> Voy a generarlo.';
    expect(stripHiddenPrompt(input)).toBe('¡Perfecto! Voy a generarlo.');
  });

  it('no modifica texto sin marcador', () => {
    const input = 'Cuéntame más sobre el diseño.';
    expect(stripHiddenPrompt(input)).toBe(input);
  });

  it('elimina el marcador y los espacios inmediatamente antes de él', () => {
    const input = 'Resumen:   <!--PROMPT:pbr|bag-->   Confirma para continuar.';
    expect(stripHiddenPrompt(input)).toBe('Resumen:   Confirma para continuar.');
  });

  it('elimina múltiples marcadores si existieran', () => {
    const input = '<!--PROMPT:realistic|bag--> texto <!--PROMPT:pbr|ring-->';
    expect(stripHiddenPrompt(input)).toBe('texto');
  });
});

// ── getProgressMessage ────────────────────────────────────────────────────────
describe('getProgressMessage', () => {
  it('devuelve el mensaje inicial en 0%', () => {
    expect(getProgressMessage(0)).toBe('Analizando el concepto…');
  });

  it('devuelve el mensaje correcto en cada umbral', () => {
    expect(getProgressMessage(15)).toBe('Construyendo geometría…');
    expect(getProgressMessage(35)).toBe('Añadiendo detalles…');
    expect(getProgressMessage(55)).toBe('Aplicando texturas…');
    expect(getProgressMessage(75)).toBe('Optimizando el mesh…');
    expect(getProgressMessage(90)).toBe('Finalizando…');
  });

  it('interpola correctamente entre umbrales', () => {
    expect(getProgressMessage(20)).toBe('Construyendo geometría…');
    expect(getProgressMessage(50)).toBe('Añadiendo detalles…');
    expect(getProgressMessage(80)).toBe('Optimizando el mesh…');
  });

  it('devuelve el último mensaje al 100%', () => {
    expect(getProgressMessage(100)).toBe('Finalizando…');
  });
});
