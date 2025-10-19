import Phaser from 'phaser';
import { Ability } from './abilities/Ability';

/**
 * Interface de usuário para mostrar cooldowns das habilidades
 */
export class AbilityUI {
  private scene: Phaser.Scene;
  private abilities: Ability[];
  private container: Phaser.GameObjects.Container;
  private abilitySlots: Map<string, AbilitySlot> = new Map();

  constructor(scene: Phaser.Scene, abilities: Ability[]) {
    this.scene = scene;
    this.abilities = abilities;
    this.container = this.scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(10000);

    this.createUI();
  }

  private createUI(): void {
    const startX = 70; // Canto inferior esquerdo
    const startY = this.scene.cameras.main.height - 100;

    this.abilities.forEach((ability, index) => {
      const x = startX + index * 100;
      const slot = new AbilitySlot(this.scene, x, startY, ability);
      this.abilitySlots.set(ability.getKey(), slot);
      this.container.add(slot.getContainer());
    });
  }

  public update(): void {
    this.abilitySlots.forEach(slot => slot.update());
  }
}

/**
 * Representa um slot individual de habilidade na UI
 */
class AbilitySlot {
  private scene: Phaser.Scene;
  private ability: Ability;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Graphics;
  private cooldownOverlay: Phaser.GameObjects.Graphics;
  private keyText: Phaser.GameObjects.Text;
  private nameText: Phaser.GameObjects.Text;
  private cooldownText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, ability: Ability) {
    this.scene = scene;
    this.ability = ability;
    this.container = this.scene.add.container(x, y);

    this.background = this.createBackground();
    this.cooldownOverlay = this.createCooldownOverlay();
    this.keyText = this.createKeyText();
    this.nameText = this.createNameText();
    this.cooldownText = this.createCooldownText();

    this.container.add([
      this.background,
      this.cooldownOverlay,
      this.keyText,
      this.nameText,
      this.cooldownText
    ]);
  }

  private createBackground(): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x2a2a3e, 0.9);
    graphics.fillRoundedRect(-35, -35, 70, 70, 8);
    graphics.lineStyle(2, 0x4a4a6e, 1);
    graphics.strokeRoundedRect(-35, -35, 70, 70, 8);
    return graphics;
  }

  private createCooldownOverlay(): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();
    return graphics;
  }

  private createKeyText(): Phaser.GameObjects.Text {
    return this.scene.add.text(0, -5, this.ability.getKey(), {
      fontFamily: 'Courier New',
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  private createNameText(): Phaser.GameObjects.Text {
    return this.scene.add.text(0, -50, this.ability.getName(), {
      fontFamily: 'Courier New',
      fontSize: '10px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }

  private createCooldownText(): Phaser.GameObjects.Text {
    return this.scene.add.text(0, 15, '', {
      fontFamily: 'Courier New',
      fontSize: '12px',
      color: '#ff6666'
    }).setOrigin(0.5);
  }

  public update(): void {
    const isOnCooldown = this.ability.isOnCooldown();

    if (isOnCooldown) {
      const remaining = this.ability.getCooldownRemaining();
      const progress = this.ability.getCooldownProgress();

      // Atualiza texto do cooldown
      this.cooldownText.setText(`${(remaining / 1000).toFixed(1)}s`);
      this.cooldownText.setVisible(true);

      // Atualiza overlay de cooldown
      this.cooldownOverlay.clear();
      this.cooldownOverlay.fillStyle(0x000000, 0.6);

      // Desenha overlay circular baseado no progresso
      const startAngle = -90; // Começa no topo
      const sweepAngle = 360 * (1 - progress);

      this.cooldownOverlay.slice(0, 0, 35,
        Phaser.Math.DegToRad(startAngle),
        Phaser.Math.DegToRad(startAngle + sweepAngle),
        false
      );
      this.cooldownOverlay.fillPath();

      // Muda cor da tecla
      this.keyText.setColor('#888888');
    } else {
      this.cooldownText.setVisible(false);
      this.cooldownOverlay.clear();
      this.keyText.setColor('#ffffff');
    }
  }

  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }
}
