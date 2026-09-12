import Scene from "../core/Scene";
import Safe from "../prefabs/Safe";

export default class Game extends Scene {
  name = "Game";

  private safe!: Safe;

  load() {
    // TODO: Load assets
    this.safe = new Safe();
    this.addChild(this.safe);
    this.safe.resize(window.innerWidth, window.innerHeight);
  }

  async start() {
    // TODO: Start the game
  }

  onResize(width: number, height: number) {
    this.safe?.resize(width, height);
  }
}
