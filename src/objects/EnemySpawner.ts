import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { Player } from './Player';
import { isometricToCartesian } from '../utils/IsometricUtils';

/**
 * Gerenciador de spawn de inimigos em ondas
 */
export class EnemySpawner {
  private scene: Phaser.Scene;
  private player: Player;
  private enemies: Enemy[] = [];
  private spawnInterval: number = 10000; // 10 segundos
  private lastSpawnTime: number = 0;
  private waveNumber: number = 0;
  private mapWidth: number;
  private mapHeight: number;

  constructor(scene: Phaser.Scene, player: Player, mapWidth: number, mapHeight: number) {
    this.scene = scene;
    this.player = player;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;

    // Spawna primeira onda imediatamente
    this.spawnWave();
  }

  public update(delta: number): void {
    const currentTime = this.scene.time.now;

    // Atualiza todos os inimigos
    this.enemies.forEach(enemy => {
      if (!enemy.isDeadState()) {
        enemy.update(delta);
      }
    });

    // Remove inimigos mortos
    this.enemies = this.enemies.filter(enemy => !enemy.isDeadState());

    // Verifica se é hora de spawnar nova onda
    if (currentTime - this.lastSpawnTime >= this.spawnInterval) {
      this.spawnWave();
      this.lastSpawnTime = currentTime;
    }
  }

  private spawnWave(): void {
    this.waveNumber++;

    // Calcula quantidade de inimigos (começa com 3-5, aumenta progressivamente)
    const baseAmount = Phaser.Math.Between(3, 5);
    const additionalEnemies = Math.floor(this.waveNumber / 3); // +1 a cada 3 ondas
    const totalEnemies = baseAmount + additionalEnemies;

    console.log(`Onda ${this.waveNumber}: Spawnando ${totalEnemies} inimigos`);

    for (let i = 0; i < totalEnemies; i++) {
      this.spawnEnemy();
    }
  }

  private spawnEnemy(): void {
    // Escolhe um lado aleatório da tela (0=cima, 1=direita, 2=baixo, 3=esquerda)
    const side = Phaser.Math.Between(0, 3);
    let gridX: number;
    let gridY: number;

    // Define posição baseada no lado
    switch (side) {
      case 0: // Topo
        gridX = Phaser.Math.Between(0, this.mapWidth - 1);
        gridY = -2; // Fora do mapa
        break;
      case 1: // Direita
        gridX = this.mapWidth + 2;
        gridY = Phaser.Math.Between(0, this.mapHeight - 1);
        break;
      case 2: // Baixo
        gridX = Phaser.Math.Between(0, this.mapWidth - 1);
        gridY = this.mapHeight + 2;
        break;
      case 3: // Esquerda
      default:
        gridX = -2;
        gridY = Phaser.Math.Between(0, this.mapHeight - 1);
        break;
    }

    const enemy = new Enemy(this.scene, gridX, gridY, this.player);
    this.enemies.push(enemy);
  }

  /**
   * Retorna todos os inimigos vivos
   */
  public getEnemies(): Enemy[] {
    return this.enemies.filter(e => !e.isDeadState());
  }

  /**
   * Remove todos os inimigos
   */
  public clear(): void {
    this.enemies.forEach(enemy => enemy.destroy());
    this.enemies = [];
  }

  /**
   * Retorna número da onda atual
   */
  public getWaveNumber(): number {
    return this.waveNumber;
  }
}
