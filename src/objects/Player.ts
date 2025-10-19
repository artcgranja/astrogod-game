import Phaser from 'phaser';
import { cartesianToIsometric, isometricToCartesian, distance, angleBetween } from '../utils/IsometricUtils';
import { AbilityManager } from './abilities/AbilityManager';
import { HealthBar } from './HealthBar';

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
  private isLockedByCast: boolean = false;

  // Sistema de vida
  private maxHealth: number = 10;
  private currentHealth: number = 10;
  private healthBar: HealthBar;
  private isInvulnerable: boolean = false;
  private onDeathCallback?: () => void;

  constructor(scene: Phaser.Scene, gridX: number, gridY: number) {
    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;
    this.sprite = this.createPlayerSprite();
    this.updatePosition();

    // Cria barra de vida
    const pos = this.getPosition();
    this.healthBar = new HealthBar(scene, pos.x, pos.y - 35, this.maxHealth);

    // Inicializa o gerenciador de habilidades
    this.abilityManager = new AbilityManager(scene);

    // Define callback para travar movimento durante cast
    this.abilityManager.setLockCallback((duration: number) => {
      this.lockMovement(duration);
    });

    // Define callback para o dash
    this.abilityManager.setDashCallback((x: number, y: number, duration: number) => {
      this.dashToPosition(x, y, duration);
    });
  }

  /**
   * Define callback para quando habilidades causam dano
   */
  public setAbilityDamageCallback(callback: (x: number, y: number, damage: number, radius?: number, knockback?: number) => void): void {
    this.abilityManager.setDamageCallback(callback);
  }

  private createPlayerSprite(): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();

    // Corpo do personagem (losango azul/ciano)
    graphics.fillStyle(0x4488ff, 1);
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

    // Atualiza posição da barra de vida
    if (this.healthBar) {
      this.healthBar.updatePosition(isoPos.x, isoPos.y - 35);
    }
  }

  public setTargetPosition(isoX: number, isoY: number): void {
    // Não permite movimento se estiver castando habilidade
    if (this.isLockedByCast) {
      return;
    }

    const cartPos = isometricToCartesian(isoX, isoY);
    this.targetX = Math.round(cartPos.x);
    this.targetY = Math.round(cartPos.y);
  }

  public update(delta: number): void {
    // Não move se estiver castando habilidade
    if (this.isLockedByCast) {
      return;
    }

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
   * Usa uma habilidade
   */
  public useAbility(key: string, targetX: number, targetY: number): boolean {
    // Não permite usar habilidade se já estiver castando
    if (this.isLockedByCast) {
      return false;
    }

    const playerPos = this.getPosition();
    return this.abilityManager.useAbility(key, playerPos.x, playerPos.y, targetX, targetY);
  }

  /**
   * Trava o movimento do player por uma duração (usado durante cast de habilidades)
   */
  public lockMovement(duration: number): void {
    this.isLockedByCast = true;

    // Cancela movimento atual
    this.targetX = null;
    this.targetY = null;

    // Agenda o unlock após a duração
    this.scene.time.delayedCall(duration, () => {
      this.unlockMovement();
    });
  }

  /**
   * Destrava o movimento do player
   */
  public unlockMovement(): void {
    this.isLockedByCast = false;
  }

  /**
   * Verifica se o player está travado por cast
   */
  public isLocked(): boolean {
    return this.isLockedByCast;
  }

  /**
   * Move o personagem com dash (usado pela habilidade E)
   */
  public dashToPosition(targetX: number, targetY: number, duration: number, onComplete?: () => void): void {
    const cartPos = isometricToCartesian(targetX, targetY);

    // Objeto que será animado pelo tween
    const dashData = {
      x: this.gridX,
      y: this.gridY
    };

    // Cria tween suave para o dash
    this.scene.tweens.add({
      targets: dashData,
      x: cartPos.x,
      y: cartPos.y,
      duration: duration,
      ease: 'Cubic.easeOut',
      onUpdate: () => {
        this.gridX = dashData.x;
        this.gridY = dashData.y;
        this.updatePosition();
      },
      onComplete: () => {
        this.gridX = cartPos.x;
        this.gridY = cartPos.y;
        this.updatePosition();
        if (onComplete) {
          onComplete();
        }
      }
    });
  }

  /**
   * Aplica dano ao player
   */
  public takeDamage(damage: number): void {
    if (this.isInvulnerable || this.currentHealth <= 0) {
      return;
    }

    this.currentHealth -= damage;
    this.healthBar.setHealth(this.currentHealth);

    // Efeito visual de dano (piscar vermelho)
    this.sprite.setAlpha(0.5);
    this.scene.time.delayedCall(100, () => {
      this.sprite.setAlpha(1);
    });

    // Verifica se morreu
    if (this.currentHealth <= 0) {
      this.die();
      return;
    }

    // Ativa invencibilidade temporária (500ms)
    this.isInvulnerable = true;
    this.scene.time.delayedCall(500, () => {
      this.isInvulnerable = false;
    });
  }

  /**
   * Chamado quando o player morre
   */
  private die(): void {
    this.currentHealth = 0;
    this.healthBar.setHealth(0);

    if (this.onDeathCallback) {
      this.onDeathCallback();
    }
  }

  /**
   * Define callback para quando o player morrer
   */
  public setOnDeathCallback(callback: () => void): void {
    this.onDeathCallback = callback;
  }

  /**
   * Verifica se o player está vivo
   */
  public isAlive(): boolean {
    return this.currentHealth > 0;
  }

  /**
   * Retorna a vida atual
   */
  public getHealth(): number {
    return this.currentHealth;
  }

  /**
   * Retorna se está invulnerável
   */
  public isInvulnerableState(): boolean {
    return this.isInvulnerable;
  }

  /**
   * Destrói o player e seus componentes
   */
  public destroy(): void {
    this.sprite.destroy();
    this.healthBar.destroy();
  }

  /**
   * Retorna o gerenciador de habilidades
   */
  public getAbilityManager(): AbilityManager {
    return this.abilityManager;
  }
}
