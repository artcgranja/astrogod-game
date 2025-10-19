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
  private speed: number = 50; // Mais lento que o player (150)
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
    if (this.isDead) {
      console.log('[Enemy] takeDamage: j\u00e1 est\u00e1 morto, ignorando');
      return;
    }

    console.log(`[Enemy] takeDamage: vida antes=${this.currentHealth}, dano=${damage}`);
    this.currentHealth -= damage;
    this.healthBar.setHealth(this.currentHealth);
    console.log(`[Enemy] takeDamage: vida depois=${this.currentHealth}`);

    // Efeito visual de dano (piscar com alpha - Graphics não tem setTint)
    this.sprite.setAlpha(0.5);
    this.scene.time.delayedCall(100, () => {
      if (this.sprite) {
        this.sprite.setAlpha(1);
      }
    });

    // Verifica se morreu
    if (this.currentHealth <= 0) {
      console.log('[Enemy] takeDamage: vida <= 0, chamando die()');
      this.die();
    }
  }

  /**
   * Empurra o inimigo para longe (usado pelo AoE)
   * @param fromIsoX Posição X isométrica de onde vem o empurrão
   * @param fromIsoY Posição Y isométrica de onde vem o empurrão
   * @param force Força em pixels
   */
  public knockback(fromIsoX: number, fromIsoY: number, force: number): void {
    if (this.isDead) return;

    const myIsoPos = this.getPosition();

    // Calcula direção no espaço isométrico
    const angle = Math.atan2(myIsoPos.y - fromIsoY, myIsoPos.x - fromIsoX);

    // Converte força de pixels para tiles (aproximadamente)
    const forceInTiles = force / 32;

    this.gridX += Math.cos(angle) * forceInTiles;
    this.gridY += Math.sin(angle) * forceInTiles;

    this.updatePosition();
  }

  private die(): void {
    console.log('[Enemy] die() chamado');
    this.isDead = true;

    // Esconde a barra de vida imediatamente
    if (this.healthBar) {
      this.healthBar.setVisible(false);
      console.log('[Enemy] die(): healthBar escondida');
    }

    // Efeito de morte (fade out apenas do sprite)
    console.log('[Enemy] die(): criando tween de fade out');
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        console.log('[Enemy] die(): tween completo, chamando destroy()');
        this.destroy();
      }
    });
  }

  public destroy(): void {
    console.log('[Enemy] destroy() chamado');
    if (this.sprite) {
      this.sprite.destroy();
      console.log('[Enemy] destroy(): sprite destru\u00eddo');
    }
    if (this.healthBar) {
      this.healthBar.destroy();
      console.log('[Enemy] destroy(): healthBar destru\u00edda');
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
