import Phaser from 'phaser';
import { LeaderboardManager } from '../utils/LeaderboardManager';

/**
 * Cena de Game Over
 */
export class GameOverScene extends Phaser.Scene {
  private kills: number = 0;
  private survivalTime: number = 0;
  private isNewRecord: boolean = false;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { kills: number; survivalTime: number }): void {
    this.kills = data.kills || 0;
    this.survivalTime = data.survivalTime || 0;

    // Salva a run no leaderboard
    LeaderboardManager.saveRun(this.kills, this.survivalTime);

    // Verifica se é recorde
    this.isNewRecord = LeaderboardManager.isNewRecord(this.kills);
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background escuro com overlay vermelho
    this.cameras.main.setBackgroundColor('#1a0a0a');

    const overlay = this.add.graphics();
    overlay.fillStyle(0xff0000, 0.1);
    overlay.fillRect(0, 0, width, height);

    // Título GAME OVER
    const gameOverText = this.add.text(width / 2, height / 4, 'GAME OVER', {
      fontFamily: 'Courier New',
      fontSize: '72px',
      color: '#ff4444',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);

    // Efeito de piscar no GAME OVER
    this.tweens.add({
      targets: gameOverText,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Novo Recorde!
    if (this.isNewRecord && this.kills > 0) {
      const recordText = this.add.text(width / 2, height / 4 + 70, '🏆 NEW RECORD! 🏆', {
        fontFamily: 'Courier New',
        fontSize: '32px',
        color: '#ffaa00',
        fontStyle: 'bold'
      });
      recordText.setOrigin(0.5);

      this.tweens.add({
        targets: recordText,
        scale: 1.1,
        duration: 300,
        yoyo: true,
        repeat: -1
      });
    }

    // Estatísticas
    const statsY = height / 2 - 20;

    // Container de estatísticas
    const statsContainer = this.add.container(width / 2, statsY);

    const statsBg = this.add.graphics();
    statsBg.fillStyle(0x000000, 0.7);
    statsBg.fillRoundedRect(-200, -80, 400, 160, 10);
    statsBg.lineStyle(2, 0x444444, 1);
    statsBg.strokeRoundedRect(-200, -80, 400, 160, 10);

    const killsText = this.add.text(0, -40, `Kills: ${this.kills}`, {
      fontFamily: 'Courier New',
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    killsText.setOrigin(0.5);

    const timeText = this.add.text(0, 10, `Time Survived: ${LeaderboardManager.formatTime(this.survivalTime)}`, {
      fontFamily: 'Courier New',
      fontSize: '24px',
      color: '#aaaaaa'
    });
    timeText.setOrigin(0.5);

    // Best Record
    const bestRun = LeaderboardManager.getBestRun();
    if (bestRun) {
      const recordText = this.add.text(0, 50, `Best: ${bestRun.kills} kills`, {
        fontFamily: 'Courier New',
        fontSize: '18px',
        color: '#888888'
      });
      recordText.setOrigin(0.5);
      statsContainer.add(recordText);
    }

    statsContainer.add([statsBg, killsText, timeText]);

    // Botões
    const retryButton = this.createButton(width / 2 - 160, height - 150, 'RETRY', () => {
      this.scene.start('GameScene');
    });

    const menuButton = this.createButton(width / 2 + 160, height - 150, 'MENU', () => {
      this.scene.start('MainMenuScene');
    });
  }

  private createButton(x: number, y: number, text: string, onClick: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Background do botão
    const bg = this.add.graphics();
    bg.fillStyle(0x2a2a3e, 1);
    bg.fillRoundedRect(-120, -30, 240, 60, 10);
    bg.lineStyle(3, 0x4a4a6e, 1);
    bg.strokeRoundedRect(-120, -30, 240, 60, 10);

    // Texto do botão
    const buttonText = this.add.text(0, 0, text, {
      fontFamily: 'Courier New',
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);

    container.add([bg, buttonText]);

    // Torna interativo
    container.setInteractive(
      new Phaser.Geom.Rectangle(-120, -30, 240, 60),
      Phaser.Geom.Rectangle.Contains
    );

    // Hover effect
    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x3a3a4e, 1);
      bg.fillRoundedRect(-120, -30, 240, 60, 10);
      bg.lineStyle(3, 0x6a6a8e, 1);
      bg.strokeRoundedRect(-120, -30, 240, 60, 10);
      buttonText.setColor('#ffff00');
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x2a2a3e, 1);
      bg.fillRoundedRect(-120, -30, 240, 60, 10);
      bg.lineStyle(3, 0x4a4a6e, 1);
      bg.strokeRoundedRect(-120, -30, 240, 60, 10);
      buttonText.setColor('#ffffff');
    });

    container.on('pointerdown', () => {
      onClick();
    });

    return container;
  }
}
