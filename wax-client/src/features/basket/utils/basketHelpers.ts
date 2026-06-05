// Las piezas custom (Atelier) guardan el GLB en pictureUrl, no una imagen real.
export const isCustom3dModel = (url: string | undefined | null): boolean =>
  /\.glb(\?|$)/i.test(url ?? '');
