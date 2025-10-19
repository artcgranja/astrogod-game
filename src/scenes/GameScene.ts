import Phaser from 'phaser';
import { IsometricMap } from '../objects/IsometricMap';
import { Player } from '../objects/Player';
import { AbilityUI } from '../objects/AbilityUI';
import { Enemy } from '../objects/Enemy';
import { EnemySpawner } from '../objects/EnemySpawner';
import { isometricToCartesian } from '../utils/IsometricUtils';

/**
 * Cena principal do jogo
 */
export class GameScene extends Phaser.Scene {
  private map!: IsometricMap;
  private player!: Player;
  private targetMarker!: Phaser.GameObjects.Graphics;
  private markerVisible: boolean = false;
  private abilityUI!: AbilityUI;
  private keys!: {
    Q: Phaser.Input.Keyboard.Key;
    W: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
  };

  // Sistema de inimigos
  private enemySpawner!: EnemySpawner;
  private killCount: number = 0;
  private killCounterText!: Phaser.GameObjects.Text;
  private startTime: number = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.startTime = Date.now();

    // Cria o mapa isométrico (20x20 tiles)
    this.map = new IsometricMap(this, 20, 20);

    // Cria o personagem no centro do mapa
    const centerX = Math.floor(this.map.getMapWidth() / 2);
    const centerY = Math.floor(this.map.getMapHeight() / 2);
    this.player = new Player(this, centerX, centerY);

    // Define callback de morte do player
    this.player.setOnDeathCallback(() => {
      this.handlePlayerDeath();
    });

    // Define callback de dano das habilidades
    this.player.setAbilityDamageCallback((x, y, damage, radius, knockback, endX, endY) => {
      this.handleAbilityDamage(x, y, damage, radius, knockback, endX, endY);
    });

    // Cria o spawner de inimigos
    this.enemySpawner = new EnemySpawner(this, this.player, this.map.getMapWidth(), this.map.getMapHeight());

    // Cria o marcador de destino (inicialmente invisível)
    this.targetMarker = this.add.graphics();
    this.targetMarker.setDepth(1000);
    this.hideTargetMarker();

    // Cria a UI de habilidades
    const abilities = this.player.getAbilityManager().getAllAbilities();
    this.abilityUI = new AbilityUI(this, abilities);

    // Configura a câmera
    this.setupCamera();

    // Configura os controles de clique
    this.setupControls();

    // Configura os controles de teclado
    this.setupKeyboardControls();

    // Exibe instruções
    this.showInstructions();

    // Cria kill counter
    this.createKillCounter();
  }

  private setupCamera(): void {
    const cam = this.cameras.main;

    // Define limites da câmera (ajustado para o tamanho do mapa)
    const mapBounds = 1280; // Tamanho aproximado do mapa
    cam.setBounds(-mapBounds, -mapBounds, mapBounds * 2, mapBounds * 2);

    // Configura a câmera para seguir o personagem
    const playerPos = this.player.getPosition();
    cam.startFollow(this.player.getSprite(), true, 0.1, 0.1);

    // Centraliza a câmera no personagem
    cam.centerOn(playerPos.x, playerPos.y);

    // Define zoom fixo
    cam.setZoom(1);
  }

  private setupControls(): void {
    // Detecta cliques no mapa
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Obtém a posição do clique relativa à câmera
      const worldX = pointer.worldX;
      const worldY = pointer.worldY;

      // Converte para coordenadas do grid
      const cartPos = isometricToCartesian(worldX, worldY);
      const gridX = Math.round(cartPos.x);
      const gridY = Math.round(cartPos.y);

      // Verifica se está dentro dos limites do mapa
      if (gridX >= 0 && gridX < this.map.getMapWidth() &&
          gridY >= 0 && gridY < this.map.getMapHeight()) {

        // Define o destino do personagem
        this.player.setTargetPosition(worldX, worldY);

        // Mostra o marcador de destino
        this.showTargetMarker(worldX, worldY);
      }
    });
  }

  private setupKeyboardControls(): void {
    // Cria as teclas Q, W, E
    this.keys = {
      Q: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      E: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    };

    // Detecta quando as teclas são pressionadas
    this.keys.Q.on('down', () => {
      const pointer = this.input.activePointer;
      this.player.useAbility('Q', pointer.worldX, pointer.worldY);
    });

    this.keys.W.on('down', () => {
      const pointer = this.input.activePointer;
      this.player.useAbility('W', pointer.worldX, pointer.worldY);
    });

    this.keys.E.on('down', () => {
      const pointer = this.input.activePointer;
      this.player.useAbility('E', pointer.worldX, pointer.worldY);
    });
  }

  private createKillCounter(): void {
    // Cria texto do kill counter com símbolo de caveira
    this.killCounterText = this.add.text(10, 90, '☠ 0', {
      fontFamily: 'Courier New',
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.killCounterText.setScrollFactor(0);
    this.killCounterText.setDepth(10000);
  }

  private updateKillCounter(): void {
    this.killCounterText.setText(`☠ ${this.killCount}`);
  }

  private showTargetMarker(x: number, y: number): void {
    this.targetMarker.clear();
    this.targetMarker.lineStyle(3, 0x00ff00, 1);
    this.targetMarker.strokeCircle(x, y, 15);
    this.targetMarker.lineStyle(2, 0x00ff00, 0.5);
    this.targetMarker.strokeCircle(x, y, 20);
    this.markerVisible = true;
  }

  private hideTargetMarker(): void {
    this.targetMarker.clear();
    this.markerVisible = false;
  }

  private showInstructions(): void {
    const instructionText = [
      'Clique no mapa para mover',
      'Q - Explosão Astral (AoE)',
      'W - Raio Cósmico',
      'E - Salto Estelar (Dash)'
    ].join('\n');

    const instructions = this.add.text(10, 10, instructionText, {
      fontFamily: 'Courier New',
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    instructions.setScrollFactor(0); // Fixa na tela
    instructions.setDepth(10000);
  }

  /**
   * Callback chamado quando habilidades causam dano
   */
  private handleAbilityDamage(x: number, y: number, damage: number, radius?: number, knockback?: number, endX?: number, endY?: number): void {
    const enemies = this.enemySpawner.getEnemies();
    console.log(`[GameScene] handleAbilityDamage: ${enemies.length} inimigos vivos`);

    // Se tem endX e endY, é um raio em linha (Beam)
    const isBeam = endX !== undefined && endY !== undefined;

    let hitCount = 0;
    enemies.forEach(enemy => {
      const enemyPos = enemy.getPosition();
      let hit = false;

      if (isBeam) {
        // Detecção em linha reta
        const distToLine = this.pointToLineDistance(enemyPos.x, enemyPos.y, x, y, endX!, endY!);

        if (radius !== undefined && distToLine <= radius) {
          hit = true;
        }
      } else {
        // Detecção em círculo (AoE)
        const dist = Phaser.Math.Distance.Between(x, y, enemyPos.x, enemyPos.y);

        if (radius !== undefined && dist <= radius) {
          hit = true;
        }
      }

      if (hit) {
        hitCount++;
        console.log(`[GameScene] Inimigo atingido #${hitCount}, aplicando ${damage} de dano`);
        enemy.takeDamage(damage);

        // Aplica knockback se especificado (usando coordenadas isométricas)
        if (knockback !== undefined) {
          const playerPos = this.player.getPosition();
          enemy.knockback(playerPos.x, playerPos.y, knockback);
        }

        // Verifica se morreu
        if (enemy.isDeadState()) {
          console.log(`[GameScene] Inimigo morto! killCount antes: ${this.killCount}`);
          this.killCount++;
          console.log(`[GameScene] killCount depois: ${this.killCount}`);
          this.updateKillCounter();
        }
      }
    });
    console.log(`[GameScene] Total de inimigos atingidos: ${hitCount}`);
  }

  /**
   * Calcula distância de um ponto a uma linha (segmento)
   */
  private pointToLineDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;

    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Chamado quando o player morre
   */
  private handlePlayerDeath(): void {
    const survivalTime = Math.floor((Date.now() - this.startTime) / 1000);

    // Aguarda um momento antes de mostrar Game Over
    this.time.delayedCall(1000, () => {
      // Transição para GameOverScene com os dados da run
      this.scene.start('GameOverScene', {
        kills: this.killCount,
        survivalTime: survivalTime
      });
    });
  }

  update(time: number, delta: number): void {
    if (!this.player.isAlive()) {
      return; // Para de atualizar se player morreu
    }

    // Atualiza o personagem
    this.player.update(delta);

    // Atualiza o spawner de inimigos
    this.enemySpawner.update(delta);

    // Atualiza a UI de habilidades
    this.abilityUI.update();

    // Esconde o marcador quando o personagem chega ao destino
    if (this.markerVisible && !this.player.isMoving()) {
      this.hideTargetMarker();
    }
  }
}
