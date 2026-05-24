// Minimal Phaser stub for jsdom test environment
const Phaser = {
  AUTO: 0,
  Game: class Game {
    constructor(_config: unknown) {}
    destroy(_removeCanvas: boolean) {}
  },
  Scene: class Scene {
    constructor(_key: unknown) {}
  },
};

export default Phaser;
