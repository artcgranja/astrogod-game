import Phaser from 'phaser';
import { Ability } from './Ability';
import { isometricToCartesian } from '../../utils/IsometricUtils';

/**
 * Habilidade E - Dash
 */
export class DashAbility extends Ability {
  private dashDistance: number = 200;
  private dashDuration: number = 500; // 0.5 segundos
  private onDashCallback?: (targetX: number, targetY: number, duration: number) => void;

  constructor(scene: Phaser.Scene) {
    super(scene, 'E', 'Salto Estelar', 4000, 500); // 4s cooldown, 0.5s lock
  }

  /**
   * Define o callback que será chamado quando o dash for executado
   */
  public setDashCallback(callback: (targetX: number, targetY: number, duration: number) => void): void {
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

    // Move o jogador com dash suave (sem efeitos visuais)
    if (this.onDashCallback) {
      this.onDashCallback(finalX, finalY, this.dashDuration);
    }
  }
}
