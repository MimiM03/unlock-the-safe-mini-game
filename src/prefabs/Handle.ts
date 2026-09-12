import gsap from "gsap";
import { Container, Sprite } from "pixi.js";
import config from "../config";

export type TurnDirection = 1 | -1; // CW (1) or CCW (-1)

export class Handle extends Container {
  private handleSprite: Sprite;
  private shadowSprite: Sprite;
  private turning = false;

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

  // CW = 1, CCW = -1. Spins both sprites in place; shadow keeps a fixed drop offset.
  async turn(direction: TurnDirection): Promise<boolean> {
    if (this.turning) return false;

    this.turning = true;

    const stepRadians = (config.handle.stepDegrees * Math.PI) / 180;
    const targetRotation =
      this.handleSprite.rotation + direction * stepRadians;

    try {
      await gsap.to([this.handleSprite, this.shadowSprite], {
        rotation: targetRotation,
        duration: config.handle.turnDuration,
        ease: "power2.out",
      });
    } finally {
      this.turning = false;
    }

    return true;
  }

  async handleFailure(direction: TurnDirection): Promise<void> {
    if (this.turning) return;

    this.turning = true;
    const stepRadians = (config.handle.failureStepDegrees * Math.PI) / 180;
    const targetRotation = this.handleSprite.rotation + direction * stepRadians;

    try {
      await gsap.to([this.handleSprite, this.shadowSprite], {
        rotation: targetRotation,
        duration: config.handle.failureDuration,
        ease: "power2.out",
      });
    } finally {
      this.turning = false;
    }
  }
}
