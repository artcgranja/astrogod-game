import Phaser from 'phaser';
import { cartesianToIsometric, isometricToCartesian, distance, angleBetween } from '../utils/IsometricUtils';
import { HealthBar } from './HealthBar';
import { Player } from './Player';

/**
 * Classe de inimigo Elite - mais forte, maior e roxo
 */
export class EliteEnemy {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Graphics;
  private gridX: number;
  private gridY: number;
  private speed: number = 40; // Mais lento que inimigo normal (50)
  private player: Player;

  // Sistema de vida (4x o normal)
  private maxHealth: number = 20;
  private currentHealth: number = 20;
  private healthBar: HealthBar;

  // Sistema de ataque (2x o dano normal)
  private attackDamage: number = 7;
  private attackRange: number = 20; // Distância para atacar (em pixels isométricos)
  private attackCooldown: number = 1500; // 1.5 segundos entre ataques
  private lastAttackTime: number = 0;
  private isDead: boolean = false;

  // Efeito visual de aura
  private auraParticles: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, gridX: number, gridY: number, player: Player) {
    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;
    this.player = player;
    this.sprite = this.createEliteSprite();
    this.auraParticles = this.createAura();
    this.updatePosition();

    // Cria barra de vida (maior para elite)
    const pos = this.getPosition();
    this.healthBar = new HealthBar(scene, pos.x, pos.y - 60, this.maxHealth);
  }

  private createEliteSprite(): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();

    // Corpo do elite (losango roxo) - 2x maior
    graphics.fillStyle(0x8844ff, 1);
    graphics.beginPath();
    graphics.moveTo(0, -40); // Topo (2x)
    graphics.lineTo(24, -20); // Direita (2x)
    graphics.lineTo(0, 0); // Base
    graphics.lineTo(-24, -20); // Esquerda (2x)
    graphics.closePath();
    graphics.fillPath();

    // Cabeça (círculo roxo escuro) - 2x maior
    graphics.fillStyle(0x4422aa, 1);
    graphics.fillCircle(0, -50, 16);

    // Olhos brilhantes (amarelos para elite)
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(-6, -52, 4);
    graphics.fillCircle(6, -52, 4);

    // Brilho nos olhos
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(-5, -53, 2);
    graphics.fillCircle(7, -53, 2);

    // Borda grossa
    graphics.lineStyle(3, 0x000000, 1);
    graphics.strokeCircle(0, -50, 16);

    // Detalhes adicionais (marcas de elite)
    graphics.lineStyle(2, 0xaa88ff, 1);
    graphics.beginPath();
    graphics.moveTo(-10, -30);
    graphics.lineTo(0, -35);
    graphics.lineTo(10, -30);
    graphics.strokePath();

    return graphics;
  }

  private createAura(): Phaser.GameObjects.Graphics {
    const aura = this.scene.add.graphics();
    aura.setDepth(-1); // Atrás do sprite
    return aura;
  }

  private updateAura(): void {
    if (this.isDead) return;

    const pos = this.getPosition();
    this.auraParticles.clear();

    // Aura pulsante roxa
    const time = this.scene.time.now / 500;
    const pulseSize = 35 + Math.sin(time) * 5;

    this.auraParticles.lineStyle(2, 0x8844ff, 0.3);
    this.auraParticles.strokeCircle(pos.x, pos.y - 20, pulseSize);

    this.auraParticles.lineStyle(1, 0xaa88ff, 0.2);
    this.auraParticles.strokeCircle(pos.x, pos.y - 20, pulseSize + 5);
  }

  private updatePosition(): void {
    const isoPos = cartesianToIsometric(this.gridX, this.gridY);
    this.sprite.setPosition(isoPos.x, isoPos.y);

    // Atualiza posição da barra de vida
    if (this.healthBar) {
      this.healthBar.updatePosition(isoPos.x, isoPos.y - 60);
    }
  }

  public update(delta: number): void {
    if (this.isDead) return;

    // Persegue o player
    this.chasePlayer(delta);

    // Tenta atacar se estiver perto
    this.tryAttack();

    // Atualiza aura
    this.updateAura();
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

    // Efeito visual de ataque (flash mais intenso)
    this.sprite.setAlpha(0.3);
    this.scene.time.delayedCall(100, () => {
      if (this.sprite) {
        this.sprite.setAlpha(1);
      }
    });
  }

  /**
   * Aplica dano ao elite
   */
  public takeDamage(damage: number): void {
    if (this.isDead) return;

    this.currentHealth -= damage;
    this.healthBar.setHealth(this.currentHealth);

    // Efeito visual de dano (piscar com alpha)
    this.sprite.setAlpha(0.5);
    this.scene.time.delayedCall(100, () => {
      if (this.sprite) {
        this.sprite.setAlpha(1);
      }
    });

    // Verifica se morreu
    if (this.currentHealth <= 0) {
      this.die();
    }
  }

  /**
   * Empurra o elite para longe (usado pelo AoE)
   */
  public knockback(fromIsoX: number, fromIsoY: number, force: number): void {
    if (this.isDead) return;

    const myIsoPos = this.getPosition();

    // Calcula direção no espaço isométrico
    const angle = Math.atan2(myIsoPos.y - fromIsoY, myIsoPos.x - fromIsoX);

    // Elite é mais pesado, recebe menos knockback (50%)
    const forceInTiles = (force / 32) * 0.5;

    this.gridX += Math.cos(angle) * forceInTiles;
    this.gridY += Math.sin(angle) * forceInTiles;

    this.updatePosition();
  }

  private die(): void {
    this.isDead = true;

    // Esconde a barra de vida imediatamente
    if (this.healthBar) {
      this.healthBar.setVisible(false);
    }

    // Efeito de morte especial (explosão de partículas roxas)
    const pos = this.getPosition();

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const particle = this.scene.add.graphics();
      particle.fillStyle(0x8844ff, 1);
      particle.fillCircle(0, 0, 4);
      particle.setPosition(pos.x, pos.y - 20);

      this.scene.tweens.add({
        targets: particle,
        x: pos.x + Math.cos(angle) * 50,
        y: pos.y - 20 + Math.sin(angle) * 50,
        alpha: 0,
        duration: 500,
        onComplete: () => particle.destroy()
      });
    }

    // Efeito de fade out
    this.scene.tweens.add({
      targets: [this.sprite, this.auraParticles],
      alpha: 0,
      duration: 400,
      onComplete: () => {
        this.destroy();
      }
    });
  }

  public destroy(): void {
    if (this.sprite) {
      this.sprite.destroy();
    }
    if (this.auraParticles) {
      this.auraParticles.destroy();
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

  /**
   * Retorna se é elite (usado para diferenciar no spawner)
   */
  public isElite(): boolean {
    return true;
  }
}
