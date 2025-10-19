import Phaser from 'phaser';
import { Ability } from './Ability';

/**
 * Habilidade Q - Dano em Área (AoE)
 */
export class AoEAbility extends Ability {
  private radius: number = 100;

  constructor(scene: Phaser.Scene) {
    // 5s cooldown, 400ms lock (80% da animação de 500ms)
    super(scene, 'Q', 'Explosão Astral', 5000, 400);
  }

  protected execute(playerX: number, playerY: number, targetX: number, targetY: number): void {
    // Cria explosão na posição do jogador
    this.createExplosionEffect(playerX, playerY);

    // Aplica dano em área (2 de dano, 100px de raio, 100px de knockback)
    if (this.onDamageCallback) {
      this.onDamageCallback(playerX, playerY, 2, this.radius, 100);
    }
  }

  private createExplosionEffect(x: number, y: number): void {
    // Círculo de expansão
    const circle = this.scene.add.graphics();
    circle.setDepth(500);

    // Animação de expansão
    let currentRadius = 0;
    const maxRadius = this.radius;

    const expandTimer = this.scene.time.addEvent({
      delay: 16,
      repeat: 20,
      callback: () => {
        circle.clear();
        currentRadius += maxRadius / 20;

        // Círculo externo (ciano)
        circle.lineStyle(4, 0x00ffff, 1 - (currentRadius / maxRadius));
        circle.strokeCircle(x, y, currentRadius);

        // Círculo interno (branco brilhante)
        circle.lineStyle(2, 0xffffff, 1 - (currentRadius / maxRadius));
        circle.strokeCircle(x, y, currentRadius * 0.8);
      }
    });

    // Remove o gráfico após a animação
    this.scene.time.delayedCall(500, () => {
      circle.destroy();
    });

    // Adiciona partículas de impacto
    this.createParticles(x, y);
  }

  private createParticles(x: number, y: number): void {
    const particleCount = 16;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const particle = this.scene.add.graphics();
      particle.fillStyle(0x88ffff, 1);
      particle.fillCircle(0, 0, 4);
      particle.setPosition(x, y);
      particle.setDepth(501);

      // Anima partícula para fora
      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * this.radius,
        y: y + Math.sin(angle) * this.radius,
        alpha: 0,
        duration: 400,
        onComplete: () => particle.destroy()
      });
    }
  }
}
