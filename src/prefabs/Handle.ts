import { Container, Sprite } from "pixi.js";

export class Handle extends Container {
  private handleSprite: Sprite;
  private shadowSprite: Sprite;

  constructor() {
    super();

    this.shadowSprite = Sprite.from("doorHandleShadow");
    this.handleSprite = Sprite.from("doorHandle");

    this.shadowSprite.anchor.set(0.5);
    this.handleSprite.anchor.set(0.5);

    const OFFSET_X = 12;
    const OFFSET_Y = 12;
    this.shadowSprite.position.set(OFFSET_X, OFFSET_Y);
    this.handleSprite.position.set(0, 0);

    this.addChild(this.shadowSprite);
    this.addChild(this.handleSprite);
  }
}