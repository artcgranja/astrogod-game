import Phaser from 'phaser';
import { Ability } from './Ability';
import { AoEAbility } from './AoEAbility';
import { BeamAbility } from './BeamAbility';
import { DashAbility } from './DashAbility';

/**
 * Gerenciador de habilidades do jogador
 */
export class AbilityManager {
  private abilities: Map<string, Ability> = new Map();
  private scene: Phaser.Scene;
  private lockCallback?: (duration: number) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initializeAbilities();
  }

  private initializeAbilities(): void {
    // Cria as três habilidades
    const aoeAbility = new AoEAbility(this.scene);
    const beamAbility = new BeamAbility(this.scene);
    const dashAbility = new DashAbility(this.scene);

    // Registra as habilidades
    this.abilities.set('Q', aoeAbility);
    this.abilities.set('W', beamAbility);
    this.abilities.set('E', dashAbility);
  }

  /**
   * Tenta usar uma habilidade
   */
  public useAbility(key: string, playerX: number, playerY: number, targetX: number, targetY: number): boolean {
    const ability = this.abilities.get(key.toUpperCase());
    if (!ability) return false;

    return ability.use(playerX, playerY, targetX, targetY);
  }

  /**
   * Obtém uma habilidade específica
   */
  public getAbility(key: string): Ability | undefined {
    return this.abilities.get(key.toUpperCase());
  }

  /**
   * Retorna todas as habilidades
   */
  public getAllAbilities(): Ability[] {
    return Array.from(this.abilities.values());
  }

  /**
   * Define callback para travar o player durante cast de habilidades
   */
  public setLockCallback(callback: (duration: number) => void): void {
    this.lockCallback = callback;
    // Passa o callback para todas as habilidades
    this.abilities.forEach(ability => {
      ability.setLockCallback(callback);
    });
  }

  /**
   * Define callback para o dash
   */
  public setDashCallback(callback: (x: number, y: number, duration: number) => void): void {
    const dashAbility = this.abilities.get('E') as DashAbility;
    if (dashAbility) {
      dashAbility.setDashCallback(callback);
    }
  }
}
