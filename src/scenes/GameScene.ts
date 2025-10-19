import Phaser from 'phaser';
import { IsometricMap } from '../objects/IsometricMap';
import { Player } from '../objects/Player';
import { AbilityUI } from '../objects/AbilityUI';
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

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Cria o mapa isométrico (20x20 tiles)
    this.map = new IsometricMap(this, 20, 20);

    // Cria o personagem no centro do mapa
    const centerX = Math.floor(this.map.getMapWidth() / 2);
    const centerY = Math.floor(this.map.getMapHeight() / 2);
    this.player = new Player(this, centerX, centerY);

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

  update(time: number, delta: number): void {
    // Atualiza o personagem
    this.player.update(delta);

    // Atualiza a UI de habilidades
    this.abilityUI.update();

    // Esconde o marcador quando o personagem chega ao destino
    if (this.markerVisible && !this.player.isMoving()) {
      this.hideTargetMarker();
    }
  }
}
