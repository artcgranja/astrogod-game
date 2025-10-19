import Phaser from 'phaser';
import { cartesianToIsometric, TILE_WIDTH, TILE_HEIGHT } from '../utils/IsometricUtils';

/**
 * Classe responsável por criar e gerenciar o mapa isométrico
 */
export class IsometricMap {
  private scene: Phaser.Scene;
  private mapWidth: number;
  private mapHeight: number;
  private tiles: Phaser.GameObjects.Graphics[] = [];

  constructor(scene: Phaser.Scene, mapWidth: number, mapHeight: number) {
    this.scene = scene;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.createMap();
  }

  private createMap(): void {
    const graphics = this.scene.add.graphics();

    // Cores alternadas para criar efeito de tabuleiro
    const color1 = 0x4a6fa5;
    const color2 = 0x5c8ab8;

    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const isoPos = cartesianToIsometric(x, y);

        // Alterna cores em padrão de tabuleiro
        const color = (x + y) % 2 === 0 ? color1 : color2;

        // Desenha o tile losango
        graphics.fillStyle(color, 1);
        graphics.beginPath();
        graphics.moveTo(isoPos.x, isoPos.y); // Topo
        graphics.lineTo(isoPos.x + TILE_WIDTH / 2, isoPos.y + TILE_HEIGHT / 2); // Direita
        graphics.lineTo(isoPos.x, isoPos.y + TILE_HEIGHT); // Base
        graphics.lineTo(isoPos.x - TILE_WIDTH / 2, isoPos.y + TILE_HEIGHT / 2); // Esquerda
        graphics.closePath();
        graphics.fillPath();

        // Desenha borda do tile
        graphics.lineStyle(1, 0x2c3e50, 0.5);
        graphics.strokePath();
      }
    }

    this.tiles.push(graphics);
  }

  public getMapWidth(): number {
    return this.mapWidth;
  }

  public getMapHeight(): number {
    return this.mapHeight;
  }

  public getCenterPosition(): { x: number; y: number } {
    return cartesianToIsometric(
      Math.floor(this.mapWidth / 2),
      Math.floor(this.mapHeight / 2)
    );
  }
}
