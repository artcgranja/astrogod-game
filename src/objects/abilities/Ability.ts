import Phaser from 'phaser';

/**
 * Classe base para todas as habilidades
 */
export abstract class Ability {
  protected scene: Phaser.Scene;
  protected cooldownTime: number; // em milissegundos
  protected lastUsedTime: number = 0;
  protected key: string;
  protected name: string;
  protected lockDuration: number; // duração em ms que o player fica travado
  protected onLockCallback?: (duration: number) => void;

  constructor(scene: Phaser.Scene, key: string, name: string, cooldownTime: number, lockDuration: number) {
    this.scene = scene;
    this.key = key;
    this.name = name;
    this.cooldownTime = cooldownTime;
    this.lockDuration = lockDuration;
  }

  /**
   * Verifica se a habilidade está em cooldown
   */
  public isOnCooldown(): boolean {
    const currentTime = this.scene.time.now;
    return (currentTime - this.lastUsedTime) < this.cooldownTime;
  }

  /**
   * Retorna o tempo restante de cooldown em milissegundos
   */
  public getCooldownRemaining(): number {
    if (!this.isOnCooldown()) return 0;
    const currentTime = this.scene.time.now;
    return this.cooldownTime - (currentTime - this.lastUsedTime);
  }

  /**
   * Retorna o progresso do cooldown (0 a 1)
   */
  public getCooldownProgress(): number {
    if (!this.isOnCooldown()) return 1;
    return 1 - (this.getCooldownRemaining() / this.cooldownTime);
  }

  /**
   * Tenta usar a habilidade
   */
  public use(playerX: number, playerY: number, targetX: number, targetY: number): boolean {
    if (this.isOnCooldown()) {
      return false;
    }

    this.lastUsedTime = this.scene.time.now;

    // Notifica o player para travar movimento
    if (this.onLockCallback) {
      this.onLockCallback(this.lockDuration);
    }

    this.execute(playerX, playerY, targetX, targetY);
    return true;
  }

  /**
   * Define callback para travar o player durante cast
   */
  public setLockCallback(callback: (duration: number) => void): void {
    this.onLockCallback = callback;
  }

  /**
   * Método abstrato que deve ser implementado por cada habilidade
   */
  protected abstract execute(playerX: number, playerY: number, targetX: number, targetY: number): void;

  public getKey(): string {
    return this.key;
  }

  public getName(): string {
    return this.name;
  }

  public getCooldownTime(): number {
    return this.cooldownTime;
  }

  public getLockDuration(): number {
    return this.lockDuration;
  }
}
