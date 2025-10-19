/**
 * Utilidades para conversão de coordenadas isométricas
 * Tile size padrão: 64x32 (largura x altura)
 */

export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

/**
 * Converte coordenadas cartesianas (grid) para isométricas (tela)
 */
export function cartesianToIsometric(cartX: number, cartY: number): { x: number; y: number } {
  return {
    x: (cartX - cartY) * (TILE_WIDTH / 2),
    y: (cartX + cartY) * (TILE_HEIGHT / 2)
  };
}

/**
 * Converte coordenadas isométricas (tela) para cartesianas (grid)
 */
export function isometricToCartesian(isoX: number, isoY: number): { x: number; y: number } {
  return {
    x: (isoX / (TILE_WIDTH / 2) + isoY / (TILE_HEIGHT / 2)) / 2,
    y: (isoY / (TILE_HEIGHT / 2) - isoX / (TILE_WIDTH / 2)) / 2
  };
}

/**
 * Calcula distância entre dois pontos
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Calcula direção em graus entre dois pontos
 */
export function angleBetween(x1: number, y1: number, x2: number, y2: number): number {
  return Math.atan2(y2 - y1, x2 - x1);
}
