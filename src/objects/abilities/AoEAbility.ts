import Phaser from 'phaser';
import { Ability } from './Ability';

/**
 * Habilidade Q - Dano em Área (AoE)
 */
export class AoEAbility extends Ability {
  private radius: number = 100;

  constructor(scene: Phaser.Scene) {
    // 5s cooldown, 500ms lock (duração da animação)
    super(scene, 'Q', 'Explosão Astral', 5000, 500);
  }

  protected execute(playerX: number, playerY: number, targetX: number, targetY: number): void {
    // Cria explosão na posição do jogador
    this.createExplosionEffect(playerX, playerY);
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

        // Círculo externo (vermelho-alaranjado)
        circle.lineStyle(4, 0xff4400, 1 - (currentRadius / maxRadius));
        circle.strokeCircle(x, y, currentRadius);

        // Círculo interno (amarelo brilhante)
        circle.lineStyle(2, 0xffff00, 1 - (currentRadius / maxRadius));
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
      particle.fillStyle(0xffaa00, 1);
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
