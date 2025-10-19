import Phaser from 'phaser';
import { Ability } from './Ability';

/**
 * Habilidade W - Raio Reto
 */
export class BeamAbility extends Ability {
  private beamLength: number = 400;
  private beamWidth: number = 20;

  constructor(scene: Phaser.Scene) {
    super(scene, 'W', 'Raio Cósmico', 3000); // 3 segundos de cooldown
  }

  protected execute(playerX: number, playerY: number, targetX: number, targetY: number): void {
    // Calcula a direção do raio
    const angle = Math.atan2(targetY - playerY, targetX - playerX);
    const endX = playerX + Math.cos(angle) * this.beamLength;
    const endY = playerY + Math.sin(angle) * this.beamLength;

    this.createBeamEffect(playerX, playerY, endX, endY, angle);
  }

  private createBeamEffect(startX: number, startY: number, endX: number, endY: number, angle: number): void {
    // Cria o raio principal
    const beam = this.scene.add.graphics();
    beam.setDepth(500);

    // Efeito de carregamento rápido
    let chargeProgress = 0;
    const chargeTimer = this.scene.time.addEvent({
      delay: 16,
      repeat: 10,
      callback: () => {
        beam.clear();
        chargeProgress += 0.1;

        // Círculo de carregamento
        beam.fillStyle(0x00ffff, 0.5);
        beam.fillCircle(startX, startY, 20 * chargeProgress);
      }
    });

    // Dispara o raio após o carregamento
    this.scene.time.delayedCall(180, () => {
      beam.clear();

      // Raio principal (ciano brilhante)
      beam.lineStyle(this.beamWidth, 0x00ffff, 0.8);
      beam.lineBetween(startX, startY, endX, endY);

      // Raio interno (branco)
      beam.lineStyle(this.beamWidth / 2, 0xffffff, 1);
      beam.lineBetween(startX, startY, endX, endY);

      // Adiciona brilho nas pontas
      beam.fillStyle(0x00ffff, 0.6);
      beam.fillCircle(startX, startY, this.beamWidth);
      beam.fillCircle(endX, endY, this.beamWidth);

      // Efeito de impacto no final
      this.createImpactEffect(endX, endY);

      // Partículas ao longo do raio
      this.createBeamParticles(startX, startY, endX, endY);

      // Remove o raio após um breve momento
      this.scene.time.delayedCall(200, () => {
        beam.destroy();
      });
    });
  }

  private createImpactEffect(x: number, y: number): void {
    const impact = this.scene.add.graphics();
    impact.setDepth(501);

    let impactSize = 0;
    const impactTimer = this.scene.time.addEvent({
      delay: 16,
      repeat: 15,
      callback: () => {
        impact.clear();
        impactSize += 3;

        impact.lineStyle(3, 0x00ffff, 1 - (impactSize / 45));
        impact.strokeCircle(x, y, impactSize);

        impact.fillStyle(0x00ffff, 0.3 * (1 - impactSize / 45));
        impact.fillCircle(x, y, impactSize);
      }
    });

    this.scene.time.delayedCall(300, () => impact.destroy());
  }

  private createBeamParticles(startX: number, startY: number, endX: number, endY: number): void {
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const x = startX + (endX - startX) * t;
      const y = startY + (endY - startY) * t;

      const particle = this.scene.add.graphics();
      particle.fillStyle(0x88ffff, 1);
      particle.fillCircle(0, 0, 3);
      particle.setPosition(x, y);
      particle.setDepth(502);

      // Partículas se dispersam
      const offsetX = (Math.random() - 0.5) * 40;
      const offsetY = (Math.random() - 0.5) * 40;

      this.scene.tweens.add({
        targets: particle,
        x: x + offsetX,
        y: y + offsetY,
        alpha: 0,
        duration: 300,
        delay: Math.random() * 100,
        onComplete: () => particle.destroy()
      });
    }
  }
}
