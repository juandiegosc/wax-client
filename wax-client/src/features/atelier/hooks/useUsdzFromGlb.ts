import { useEffect, useState } from 'react';

// iOS solo soporta AR Quick Look y requiere formato USDZ. Como Meshy nos da GLB,
// hacemos la conversion en el browser usando Three.js USDZExporter — solo
// cuando detectamos un dispositivo Apple. En Android este hook no hace nada
// (Android usa el GLB directamente via Scene Viewer / ARCore).
//
// La conversion es ephemera: el USDZ vive como Blob URL en memoria del browser
// y se libera al desmontar. Backend no se entera, sigue almacenando solo el GLB.

const isAppleDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  // iPad moderno reporta MacIntel con maxTouchPoints>1; iPhone/iPod son rectos.
  const ua = navigator.userAgent;
  if (/iPhone|iPod|iPad/.test(ua)) return true;
  if (ua.includes('Mac') && navigator.maxTouchPoints > 1) return true;
  return false;
};

export const useUsdzFromGlb = (glbUrl: string | undefined | null): {
  usdzUrl: string | null;
  isConverting: boolean;
  error: string | null;
} => {
  const [usdzUrl, setUsdzUrl] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Solo convertimos cuando el dispositivo es Apple — Android usa el GLB directo.
    if (!glbUrl || !isAppleDevice()) {
      setUsdzUrl(null);
      return;
    }

    let cancelled = false;
    let createdBlobUrl: string | null = null;

    setIsConverting(true);
    setError(null);

    (async () => {
      try {
        // Lazy-load: solo cargamos three.js si el dispositivo es Apple.
        const [{ GLTFLoader }, { USDZExporter }] = await Promise.all([
          import('three/examples/jsm/loaders/GLTFLoader.js'),
          import('three/examples/jsm/exporters/USDZExporter.js'),
        ]);

        if (cancelled) return;

        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(glbUrl);

        if (cancelled) return;

        const exporter = new USDZExporter();
        const arrayBuffer = await exporter.parseAsync(gltf.scene);

        if (cancelled) return;

        const blob = new Blob([arrayBuffer], { type: 'model/vnd.usdz+zip' });
        createdBlobUrl = URL.createObjectURL(blob);
        setUsdzUrl(createdBlobUrl);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Error convirtiendo a USDZ');
          setUsdzUrl(null);
        }
      } finally {
        if (!cancelled) setIsConverting(false);
      }
    })();

    return () => {
      cancelled = true;
      if (createdBlobUrl) URL.revokeObjectURL(createdBlobUrl);
    };
  }, [glbUrl]);

  return { usdzUrl, isConverting, error };
};
