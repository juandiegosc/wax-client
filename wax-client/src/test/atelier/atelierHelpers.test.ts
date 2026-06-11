import { describe, it, expect } from 'vitest';
import {
  isAffirmative,
  extractAtelierMarker,
  stripHiddenMarkers,
  getProgressMessage,
} from '@/features/atelier/utils/atelierHelpers';

// isAffirmative
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

// extractAtelierMarker
describe('extractAtelierMarker', () => {
  it('extrae marcador SKETCH con prompt y descripción', () => {
    const result = extractAtelierMarker(
      '¡Generando! <!--SKETCH:a black leather tote|Bolso tote en cuero negro-->'
    );
    expect(result).toEqual({
      kind: 'sketch',
      prompt: 'a black leather tote',
      description: 'Bolso tote en cuero negro',
    });
  });

  it('extrae marcador SKETCH solo con prompt (sin descripción)', () => {
    const result = extractAtelierMarker('<!--SKETCH:a leather handbag-->');
    expect(result).toEqual({ kind: 'sketch', prompt: 'a leather handbag', description: undefined });
  });

  it('detecta marcador CONFIRM', () => {
    const result = extractAtelierMarker('¡Vamos! Creando tu modelo 3D. <!--CONFIRM-->');
    expect(result).toEqual({ kind: 'confirm' });
  });

  it('devuelve null si no hay marcador', () => {
    expect(extractAtelierMarker('Texto normal sin marcador')).toBeNull();
  });

  it('es case-insensitive en el tag', () => {
    const sketch = extractAtelierMarker('<!--sketch:a belt|Cinturón-->');
    expect(sketch).toEqual({ kind: 'sketch', prompt: 'a belt', description: 'Cinturón' });
    const confirm = extractAtelierMarker('<!--confirm-->');
    expect(confirm).toEqual({ kind: 'confirm' });
  });

  it('funciona con marcador SKETCH en medio del texto', () => {
    const result = extractAtelierMarker(
      '¡Perfecto! <!--SKETCH:white leather tote bag|Bolso tote blanco--> Generando…'
    );
    expect(result).toEqual({
      kind: 'sketch',
      prompt: 'white leather tote bag',
      description: 'Bolso tote blanco',
    });
  });
});

// stripHiddenMarkers
describe('stripHiddenMarkers', () => {
  it('elimina marcador SKETCH del texto', () => {
    const input = '¡Perfecto! <!--SKETCH:a bag|Bolso--> Voy a generarlo.';
    expect(stripHiddenMarkers(input)).toBe('¡Perfecto! Voy a generarlo.');
  });

  it('elimina marcador CONFIRM del texto', () => {
    const input = '¡Vamos! <!--CONFIRM--> Generando 3D.';
    expect(stripHiddenMarkers(input)).toBe('¡Vamos! Generando 3D.');
  });

  it('no modifica texto sin marcador', () => {
    const input = 'Cuéntame más sobre el diseño.';
    expect(stripHiddenMarkers(input)).toBe(input);
  });

  it('elimina el marcador y los espacios inmediatamente antes', () => {
    const input = 'Resumen:   <!--SKETCH:bag|Bolso-->   Confirma para continuar.';
    expect(stripHiddenMarkers(input)).toBe('Resumen:   Confirma para continuar.');
  });

  it('elimina múltiples marcadores mixtos', () => {
    const input = '<!--SKETCH:bag|Bolso--> texto <!--CONFIRM-->';
    expect(stripHiddenMarkers(input)).toBe('texto');
  });
});

// getProgressMessage
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
