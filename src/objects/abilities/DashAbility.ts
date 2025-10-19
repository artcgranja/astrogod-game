import Phaser from 'phaser';
import { Ability } from './Ability';
import { isometricToCartesian } from '../../utils/IsometricUtils';

/**
 * Habilidade E - Dash
 */
export class DashAbility extends Ability {
  private dashDistance: number = 200;
  private onDashCallback?: (targetX: number, targetY: number) => void;

  constructor(scene: Phaser.Scene) {
    super(scene, 'E', 'Salto Estelar', 4000); // 4 segundos de cooldown
  }

  /**
   * Define o callback que será chamado quando o dash for executado
   */
  public setDashCallback(callback: (targetX: number, targetY: number) => void): void {
    this.onDashCallback = callback;
  }

  protected execute(playerX: number, playerY: number, targetX: number, targetY: number): void {
    // Calcula a direção do dash
    const angle = Math.atan2(targetY - playerY, targetX - playerX);

    // Calcula posição final do dash (limitada pela distância máxima)
    const distance = Math.min(
      this.dashDistance,
      Phaser.Math.Distance.Between(playerX, playerY, targetX, targetY)
    );

    const finalX = playerX + Math.cos(angle) * distance;
    const finalY = playerY + Math.sin(angle) * distance;

    // Cria efeito visual do dash
    this.createDashEffect(playerX, playerY, finalX, finalY);

    // Move o jogador instantaneamente
    if (this.onDashCallback) {
      this.onDashCallback(finalX, finalY);
    }
  }

  private createDashEffect(startX: number, startY: number, endX: number, endY: number): void {
    // Rastro do dash
    const trail = this.scene.add.graphics();
    trail.setDepth(499);

    // Linha do rastro (roxo/magenta)
    trail.lineStyle(8, 0xff00ff, 0.6);
    trail.lineBetween(startX, startY, endX, endY);

    trail.lineStyle(4, 0xffffff, 0.8);
    trail.lineBetween(startX, startY, endX, endY);

    // Efeito de explosão na posição inicial
    this.createBurstEffect(startX, startY, 0xff00ff);

    // Efeito de explosão na posição final
    this.scene.time.delayedCall(100, () => {
      this.createBurstEffect(endX, endY, 0xff00ff);
    });

    // Partículas ao longo do trajeto
    this.createDashParticles(startX, startY, endX, endY);

    // Remove o rastro
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      duration: 400,
      onComplete: () => trail.destroy()
    });
  }

  private createBurstEffect(x: number, y: number, color: number): void {
    const burst = this.scene.add.graphics();
    burst.setDepth(500);

    let burstSize = 0;
    const burstTimer = this.scene.time.addEvent({
      delay: 16,
      repeat: 12,
      callback: () => {
        burst.clear();
        burstSize += 4;

        // Círculos concêntricos
        burst.lineStyle(3, color, 1 - (burstSize / 48));
        burst.strokeCircle(x, y, burstSize);

        burst.lineStyle(2, 0xffffff, 1 - (burstSize / 48));
        burst.strokeCircle(x, y, burstSize * 0.7);
      }
    });

    this.scene.time.delayedCall(250, () => burst.destroy());
  }

  private createDashParticles(startX: number, startY: number, endX: number, endY: number): void {
    const particleCount = 15;
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const x = startX + (endX - startX) * t;
      const y = startY + (endY - startY) * t;

      const particle = this.scene.add.graphics();
      particle.fillStyle(0xff00ff, 1);
      particle.fillCircle(0, 0, 5);
      particle.setPosition(x, y);
      particle.setDepth(498);

      // Partículas desaparecem gradualmente
      this.scene.tweens.add({
        targets: particle,
        alpha: 0,
        scale: 0.2,
        duration: 400,
        delay: i * 20,
        onComplete: () => particle.destroy()
      });
    }
  }
}
