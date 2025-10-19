import Phaser from 'phaser';
import { LeaderboardManager } from '../utils/LeaderboardManager';

/**
 * Cena do Leaderboard
 */
export class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LeaderboardScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background escuro
    this.cameras.main.setBackgroundColor('#0a0a1a');

    // Título
    const title = this.add.text(width / 2, 60, 'LEADERBOARD', {
      fontFamily: 'Courier New',
      fontSize: '48px',
      color: '#ffaa00',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // Subtítulo
    const subtitle = this.add.text(width / 2, 110, 'Top 10 Runs', {
      fontFamily: 'Courier New',
      fontSize: '18px',
      color: '#888888'
    });
    subtitle.setOrigin(0.5);

    // Obtém todos os runs
    const runs = LeaderboardManager.getAll();

    // Container de leaderboard
    const startY = 160;
    const lineHeight = 40;

    if (runs.length === 0) {
      // Mensagem quando não há dados
      const emptyText = this.add.text(width / 2, height / 2, 'No runs yet!\n\nPlay the game to set a record.', {
        fontFamily: 'Courier New',
        fontSize: '20px',
        color: '#666666',
        align: 'center'
      });
      emptyText.setOrigin(0.5);
    } else {
      // Cabeçalho
      const headerBg = this.add.graphics();
      headerBg.fillStyle(0x2a2a3e, 0.8);
      headerBg.fillRoundedRect(50, startY - 10, width - 100, 35, 5);

      const rankHeader = this.add.text(80, startY, 'RANK', {
        fontFamily: 'Courier New',
        fontSize: '16px',
        color: '#ffaa00',
        fontStyle: 'bold'
      });

      const killsHeader = this.add.text(width / 2 - 100, startY, 'KILLS', {
        fontFamily: 'Courier New',
        fontSize: '16px',
        color: '#ffaa00',
        fontStyle: 'bold'
      });

      const timeHeader = this.add.text(width / 2 + 20, startY, 'TIME', {
        fontFamily: 'Courier New',
        fontSize: '16px',
        color: '#ffaa00',
        fontStyle: 'bold'
      });

      const dateHeader = this.add.text(width - 180, startY, 'DATE', {
        fontFamily: 'Courier New',
        fontSize: '16px',
        color: '#ffaa00',
        fontStyle: 'bold'
      });

      // Lista de runs
      runs.forEach((run, index) => {
        const y = startY + 35 + (index * lineHeight);

        // Background alternado
        if (index % 2 === 0) {
          const bg = this.add.graphics();
          bg.fillStyle(0x1a1a2e, 0.5);
          bg.fillRoundedRect(50, y - 5, width - 100, 35, 5);
        }

        // Cor especial para top 3
        let rankColor = '#ffffff';
        let rankPrefix = '';
        if (index === 0) {
          rankColor = '#ffd700'; // Ouro
          rankPrefix = '👑 ';
        } else if (index === 1) {
          rankColor = '#c0c0c0'; // Prata
        } else if (index === 2) {
          rankColor = '#cd7f32'; // Bronze
        }

        // Rank
        const rankText = this.add.text(80, y, `${rankPrefix}#${index + 1}`, {
          fontFamily: 'Courier New',
          fontSize: '18px',
          color: rankColor,
          fontStyle: 'bold'
        });

        // Kills
        const killsText = this.add.text(width / 2 - 100, y, `☠ ${run.kills}`, {
          fontFamily: 'Courier New',
          fontSize: '18px',
          color: '#ffffff'
        });

        // Time
        const timeText = this.add.text(width / 2 + 20, y, LeaderboardManager.formatTime(run.survivalTime), {
          fontFamily: 'Courier New',
          fontSize: '18px',
          color: '#aaaaaa'
        });

        // Date
        const date = new Date(run.timestamp);
        const dateStr = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const dateText = this.add.text(width - 180, y, dateStr, {
          fontFamily: 'Courier New',
          fontSize: '16px',
          color: '#666666'
        });
      });
    }

    // Botão Back
    const backButton = this.createButton(width / 2, height - 80, 'BACK TO MENU', () => {
      this.scene.start('MainMenuScene');
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
      fontSize: '24px',
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
