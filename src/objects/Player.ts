import Phaser from 'phaser';
import { cartesianToIsometric, isometricToCartesian, distance, angleBetween } from '../utils/IsometricUtils';
import { AbilityManager } from './abilities/AbilityManager';

/**
 * Classe do personagem principal
 */
export class Player {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Graphics;
  private gridX: number;
  private gridY: number;
  private targetX: number | null = null;
  private targetY: number | null = null;
  private speed: number = 150; // pixels por segundo
  private abilityManager: AbilityManager;

  constructor(scene: Phaser.Scene, gridX: number, gridY: number) {
    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;
    this.sprite = this.createPlayerSprite();
    this.updatePosition();

    // Inicializa o gerenciador de habilidades
    this.abilityManager = new AbilityManager(scene);

    // Define callback para o dash
    this.abilityManager.setDashCallback((x: number, y: number) => {
      this.dashTo(x, y);
    });
  }

  private createPlayerSprite(): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();

    // Corpo do personagem (losango vermelho)
    graphics.fillStyle(0xff4444, 1);
    graphics.beginPath();
    graphics.moveTo(0, -20); // Topo
    graphics.lineTo(12, -10); // Direita
    graphics.lineTo(0, 0); // Base
    graphics.lineTo(-12, -10); // Esquerda
    graphics.closePath();
    graphics.fillPath();

    // Cabeça (círculo amarelo)
    graphics.fillStyle(0xffff44, 1);
    graphics.fillCircle(0, -25, 8);

    // Borda
    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokeCircle(0, -25, 8);

    return graphics;
  }

  private updatePosition(): void {
    const isoPos = cartesianToIsometric(this.gridX, this.gridY);
    this.sprite.setPosition(isoPos.x, isoPos.y);
  }

  public setTargetPosition(isoX: number, isoY: number): void {
    const cartPos = isometricToCartesian(isoX, isoY);
    this.targetX = Math.round(cartPos.x);
    this.targetY = Math.round(cartPos.y);
  }

  public update(delta: number): void {
    if (this.targetX === null || this.targetY === null) {
      return;
    }

    const dist = distance(this.gridX, this.gridY, this.targetX, this.targetY);

    // Se chegou próximo o suficiente do destino
    if (dist < 0.1) {
      this.gridX = this.targetX;
      this.gridY = this.targetY;
      this.targetX = null;
      this.targetY = null;
      this.updatePosition();
      return;
    }

    // Move em direção ao alvo
    const angle = angleBetween(this.gridX, this.gridY, this.targetX, this.targetY);
    const speedInTiles = (this.speed / 32) * (delta / 1000); // Converte velocidade para tiles por frame

    this.gridX += Math.cos(angle) * speedInTiles;
    this.gridY += Math.sin(angle) * speedInTiles;

    this.updatePosition();
  }

  public getSprite(): Phaser.GameObjects.Graphics {
    return this.sprite;
  }

  public getPosition(): { x: number; y: number } {
    const isoPos = cartesianToIsometric(this.gridX, this.gridY);
    return isoPos;
  }

  public getGridPosition(): { x: number; y: number } {
    return { x: this.gridX, y: this.gridY };
  }

  public isMoving(): boolean {
    return this.targetX !== null && this.targetY !== null;
  }

  /**
   * Move o personagem instantaneamente para uma posição (usado pelo dash)
   */
  public dashTo(isoX: number, isoY: number): void {
    const cartPos = isometricToCartesian(isoX, isoY);
    this.gridX = cartPos.x;
    this.gridY = cartPos.y;
    this.targetX = null;
    this.targetY = null;
    this.updatePosition();
  }

  /**
   * Usa uma habilidade
   */
  public useAbility(key: string, targetX: number, targetY: number): boolean {
    const playerPos = this.getPosition();
    return this.abilityManager.useAbility(key, playerPos.x, playerPos.y, targetX, targetY);
  }

  /**
   * Retorna o gerenciador de habilidades
   */
  public getAbilityManager(): AbilityManager {
    return this.abilityManager;
  }
}
