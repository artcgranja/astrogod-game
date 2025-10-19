import Phaser from 'phaser';

/**
 * Cena do Menu Principal
 */
export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background escuro
    this.cameras.main.setBackgroundColor('#0a0a1a');

    // Título do jogo
    const title = this.add.text(width / 2, height / 3, 'ASTROGOD GAME', {
      fontFamily: 'Courier New',
      fontSize: '64px',
      color: '#ffaa00',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // Subtítulo
    const subtitle = this.add.text(width / 2, height / 3 + 60, 'Survive the Cosmic Onslaught', {
      fontFamily: 'Courier New',
      fontSize: '20px',
      color: '#888888',
      fontStyle: 'italic'
    });
    subtitle.setOrigin(0.5);

    // Botão Start Game
    const startButton = this.createButton(width / 2, height / 2 + 40, 'START GAME', () => {
      this.scene.start('GameScene');
    });

    // Botão Leaderboard
    const leaderboardButton = this.createButton(width / 2, height / 2 + 120, 'LEADERBOARD', () => {
      this.scene.start('LeaderboardScene');
    });

    // Instruções de controle (pequenas)
    const controls = this.add.text(width / 2, height - 100,
      'CONTROLS: Click to move | Q/W/E: Abilities',
      {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#666666'
      }
    );
    controls.setOrigin(0.5);

    // Versão
    const version = this.add.text(10, height - 20, 'v0.1.0', {
      fontFamily: 'Courier New',
      fontSize: '12px',
      color: '#444444'
    });
  }

  private createButton(x: number, y: number, text: string, onClick: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Background do botão
    const bg = this.add.graphics();
    bg.fillStyle(0x2a2a3e, 1);
    bg.fillRoundedRect(-150, -30, 300, 60, 10);
    bg.lineStyle(3, 0x4a4a6e, 1);
    bg.strokeRoundedRect(-150, -30, 300, 60, 10);

    // Texto do botão
    const buttonText = this.add.text(0, 0, text, {
      fontFamily: 'Courier New',
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);

    container.add([bg, buttonText]);
    container.setSize(300, 60);

    // Torna interativo
    container.setInteractive(
      new Phaser.Geom.Rectangle(-150, -30, 300, 60),
      Phaser.Geom.Rectangle.Contains
    );

    // Hover effect
    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x3a3a4e, 1);
      bg.fillRoundedRect(-150, -30, 300, 60, 10);
      bg.lineStyle(3, 0x6a6a8e, 1);
      bg.strokeRoundedRect(-150, -30, 300, 60, 10);
      buttonText.setColor('#ffff00');
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x2a2a3e, 1);
      bg.fillRoundedRect(-150, -30, 300, 60, 10);
      bg.lineStyle(3, 0x4a4a6e, 1);
      bg.strokeRoundedRect(-150, -30, 300, 60, 10);
      buttonText.setColor('#ffffff');
    });

    container.on('pointerdown', () => {
      onClick();
    });

    return container;
  }
}
