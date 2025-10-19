import Phaser from 'phaser';

/**
 * Barra de vida visual que aparece acima dos personagens
 */
export class HealthBar {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private maxHealth: number;
  private currentHealth: number;
  private bar: Phaser.GameObjects.Graphics;
  private width: number = 40;
  private height: number = 4;

  constructor(scene: Phaser.Scene, x: number, y: number, maxHealth: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.bar = this.scene.add.graphics();
    this.bar.setDepth(1000);
    this.draw();
  }

  private draw(): void {
    this.bar.clear();

    // Background (barra vazia - vermelha)
    this.bar.fillStyle(0x000000, 0.5);
    this.bar.fillRect(this.x - this.width / 2, this.y, this.width, this.height);

    // Health bar (barra cheia - verde)
    const healthPercentage = this.currentHealth / this.maxHealth;
    const healthWidth = this.width * healthPercentage;

    // Cor muda conforme a vida
    let color = 0x00ff00; // Verde
    if (healthPercentage < 0.3) {
      color = 0xff0000; // Vermelho
    } else if (healthPercentage < 0.6) {
      color = 0xffaa00; // Laranja
    }

    this.bar.fillStyle(color, 1);
    this.bar.fillRect(this.x - this.width / 2, this.y, healthWidth, this.height);

    // Borda
    this.bar.lineStyle(1, 0xffffff, 0.8);
    this.bar.strokeRect(this.x - this.width / 2, this.y, this.width, this.height);
  }

  public setHealth(health: number): void {
    this.currentHealth = Math.max(0, Math.min(health, this.maxHealth));
    this.draw();
  }

  public updatePosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.draw();
  }

  public destroy(): void {
    this.bar.destroy();
  }

  public getHealth(): number {
    return this.currentHealth;
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public setVisible(visible: boolean): void {
    this.bar.setVisible(visible);
  }
}
