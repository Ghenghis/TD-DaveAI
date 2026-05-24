import Phaser from 'phaser';
import type { TowerKind } from '@td/shared';

interface HudState {
  lives: number;
  gold: number;
  wave: number;
  aiSource: 'ai' | 'fallback' | 'pending';
  fallbackCount: number;
}

interface HudCallbacks {
  onSelectTower(kind: TowerKind): void;
}

export class Hud {
  private livesText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private aiText!: Phaser.GameObjects.Text;
  private banner!: Phaser.GameObjects.Text;
  private selectedKind: TowerKind = 'arrow';
  private buttons = new Map<TowerKind, Phaser.GameObjects.Text>();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly cb: HudCallbacks,
  ) {
    const w = scene.scale.width;
    const h = scene.scale.height;
    const topY = 16;
    this.livesText = scene.add
      .text(16, topY, '', { fontSize: '24px', color: '#ff8888' })
      .setScrollFactor(0)
      .setDepth(1000);
    this.goldText = scene.add
      .text(180, topY, '', { fontSize: '24px', color: '#ffd700' })
      .setScrollFactor(0)
      .setDepth(1000);
    this.waveText = scene.add
      .text(340, topY, '', { fontSize: '24px', color: '#ffffff' })
      .setScrollFactor(0)
      .setDepth(1000);
    this.aiText = scene.add
      .text(w - 16, topY, '', { fontSize: '14px', color: '#88aaff' })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(1000);

    const kinds: TowerKind[] = ['arrow', 'cannon', 'frost', 'barracks'];
    kinds.forEach((kind, i) => {
      const x = 16 + i * 220;
      const btn = scene.add
        .text(x, h - 48, this.label(kind), {
          fontSize: '20px',
          color: '#ffffff',
          backgroundColor: '#222244',
          padding: { x: 12, y: 8 },
        })
        .setScrollFactor(0)
        .setDepth(1000)
        .setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => this.select(kind));
      this.buttons.set(kind, btn);
    });
    // selectedKind is initialized to 'arrow', so select('arrow') would short-circuit
    // on the equality guard and never apply the highlight. Apply the initial
    // selection background directly here instead.
    this.buttons.get(this.selectedKind)?.setBackgroundColor('#445588');

    this.banner = scene.add
      .text(w / 2, h / 2, '', {
        fontSize: '64px',
        color: '#ffffff',
        fontStyle: 'bold',
        backgroundColor: '#000000aa',
        padding: { x: 24, y: 16 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2000)
      .setAlpha(0);
  }

  update(s: HudState): void {
    this.livesText.setText(`♥ ${s.lives}`);
    this.goldText.setText(`◯ ${s.gold}`);
    this.waveText.setText(`Wave ${s.wave}`);
    const src = s.aiSource === 'ai' ? 'AI' : s.aiSource === 'fallback' ? 'FALLBACK' : 'PREP';
    this.aiText.setText(`director: ${src}${s.fallbackCount ? ` (fb:${s.fallbackCount})` : ''}`);
  }

  flashWaveBanner(wave: number): void {
    this.banner.setText(`Wave ${wave}`);
    this.scene.tweens.add({
      targets: this.banner,
      alpha: { from: 1, to: 0 },
      duration: 1500,
      ease: 'Sine.easeOut',
    });
  }

  private select(kind: TowerKind): void {
    if (this.selectedKind === kind) return;
    this.buttons.get(this.selectedKind)?.setBackgroundColor('#222244');
    this.buttons.get(kind)?.setBackgroundColor('#445588');
    this.selectedKind = kind;
    this.cb.onSelectTower(kind);
  }

  private label(kind: TowerKind): string {
    const costs: Record<TowerKind, number> = { arrow: 50, cannon: 100, frost: 75, barracks: 80 };
    const names: Record<TowerKind, string> = {
      arrow: 'Arrow',
      cannon: 'Cannon',
      frost: 'Frost',
      barracks: 'Barracks',
    };
    return `${names[kind]}  ◯${costs[kind]}`;
  }
}
