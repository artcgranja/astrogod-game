import Phaser from 'phaser';
import { cartesianToIsometric, isometricToCartesian, distance, angleBetween } from '../utils/IsometricUtils';
import { HealthBar } from './HealthBar';
import { Player } from './Player';

/**
 * Classe de inimigo que persegue o player
 */
export class Enemy {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Graphics;
  private gridX: number;
  private gridY: number;
  private speed: number = 100; // Mais lento que o player
  private player: Player;

  // Sistema de vida
  private maxHealth: number = 5;
  private currentHealth: number = 5;
  private healthBar: HealthBar;

  // Sistema de ataque
  private attackDamage: number = 3.5;
  private attackRange: number = 20; // Distância para atacar (em pixels isométricos)
  private attackCooldown: number = 1500; // 1.5 segundos entre ataques
  private lastAttackTime: number = 0;
  private isDead: boolean = false;

  constructor(scene: Phaser.Scene, gridX: number, gridY: number, player: Player) {
    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;
    this.player = player;
    this.sprite = this.createEnemySprite();
    this.updatePosition();

    // Cria barra de vida
    const pos = this.getPosition();
    this.healthBar = new HealthBar(scene, pos.x, pos.y - 35, this.maxHealth);
  }

  private createEnemySprite(): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();

    // Corpo do inimigo (losango vermelho)
    graphics.fillStyle(0xff3333, 1);
    graphics.beginPath();
    graphics.moveTo(0, -20); // Topo
    graphics.lineTo(12, -10); // Direita
    graphics.lineTo(0, 0); // Base
    graphics.lineTo(-12, -10); // Esquerda
    graphics.closePath();
    graphics.fillPath();

    // Cabeça (círculo roxo escuro)
    graphics.fillStyle(0x884488, 1);
    graphics.fillCircle(0, -25, 8);

    // Olhos (para parecer hostil)
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(-3, -26, 2);
    graphics.fillCircle(3, -26, 2);

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

  public update(delta: number): void {
    if (this.isDead) return;

    // Persegue o player
    this.chasePlayer(delta);

    // Tenta atacar se estiver perto
    this.tryAttack();
  }

  private chasePlayer(delta: number): void {
    const playerGrid = this.player.getGridPosition();
    const dist = distance(this.gridX, this.gridY, playerGrid.x, playerGrid.y);

    // Se está longe, persegue
    if (dist > 0.5) {
      const angle = angleBetween(this.gridX, this.gridY, playerGrid.x, playerGrid.y);
      const speedInTiles = (this.speed / 32) * (delta / 1000);

      this.gridX += Math.cos(angle) * speedInTiles;
      this.gridY += Math.sin(angle) * speedInTiles;

      this.updatePosition();
    }
  }

  private tryAttack(): void {
    const currentTime = this.scene.time.now;

    // Verifica cooldown
    if (currentTime - this.lastAttackTime < this.attackCooldown) {
      return;
    }

    // Verifica distância do player
    const playerPos = this.player.getPosition();
    const myPos = this.getPosition();
    const dist = Phaser.Math.Distance.Between(myPos.x, myPos.y, playerPos.x, playerPos.y);

    if (dist <= this.attackRange) {
      this.attack();
      this.lastAttackTime = currentTime;
    }
  }

  private attack(): void {
    // Ataca o player
    this.player.takeDamage(this.attackDamage);

    // Efeito visual de ataque (piscar)
    this.sprite.setAlpha(0.5);
    this.scene.time.delayedCall(100, () => {
      if (this.sprite) {
        this.sprite.setAlpha(1);
      }
    });
  }

  /**
   * Aplica dano ao inimigo
   */
  public takeDamage(damage: number): void {
    if (this.isDead) return;

    this.currentHealth -= damage;
    this.healthBar.setHealth(this.currentHealth);

    // Efeito visual de dano
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      if (this.sprite) {
        this.sprite.clearTint();
      }
    });

    // Verifica se morreu
    if (this.currentHealth <= 0) {
      this.die();
    }
  }

  /**
   * Empurra o inimigo para longe (usado pelo AoE)
   */
  public knockback(fromX: number, fromY: number, force: number): void {
    if (this.isDead) return;

    const angle = Math.atan2(this.gridY - fromY, this.gridX - fromX);
    const forceInTiles = force / 32; // Converte pixels para tiles

    this.gridX += Math.cos(angle) * forceInTiles;
    this.gridY += Math.sin(angle) * forceInTiles;

    this.updatePosition();
  }

  private die(): void {
    this.isDead = true;

    // Efeito de morte (fade out)
    this.scene.tweens.add({
      targets: [this.sprite, this.healthBar],
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.destroy();
      }
    });
  }

  public destroy(): void {
    if (this.sprite) {
      this.sprite.destroy();
    }
    if (this.healthBar) {
      this.healthBar.destroy();
    }
  }

  public getPosition(): { x: number; y: number } {
    const isoPos = cartesianToIsometric(this.gridX, this.gridY);
    return isoPos;
  }

  public getGridPosition(): { x: number; y: number } {
    return { x: this.gridX, y: this.gridY };
  }

  public isDeadState(): boolean {
    return this.isDead;
  }

  public getSprite(): Phaser.GameObjects.Graphics {
    return this.sprite;
  }
}
