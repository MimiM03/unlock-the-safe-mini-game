import { Container, Sprite } from "pixi.js";
import Keyboard from "../core/Keyboard";
import { Handle, type TurnDirection } from "./Handle";
import { CombinationManager } from "../backend/CombinationManager";

export default class Safe extends Container {
  private background: Sprite;
  private doorClosed: Sprite;
  private handle: Handle;
  private keyboard = Keyboard.getInstance();
  private combinationManager = new CombinationManager();

  constructor() {
    super();

    this.background = Sprite.from("background");
    this.doorClosed = Sprite.from("doorClosed");
    this.handle = new Handle();

    this.background.anchor.set(0.5);
    this.doorClosed.anchor.set(1, 0.5);

    const DOOR_CLOSED_OFFSET_X = 440;
    const DOOR_CLOSED_OFFSET_Y = -40;
    this.doorClosed.position.set(DOOR_CLOSED_OFFSET_X, DOOR_CLOSED_OFFSET_Y);

    const HANDLE_OFFSET_X = 0;
    const HANDLE_OFFSET_Y = -40;
    this.handle.position.set(HANDLE_OFFSET_X, HANDLE_OFFSET_Y);

    this.addChild(this.background, this.doorClosed, this.handle);

    this.setupInput();
  }

  private setupInput() {
    this.keyboard.onAction(({ action, buttonState }) => {
      if (buttonState !== "pressed") return;

      if (action === "LEFT") void this.turnHandle(-1);
      if (action === "RIGHT") void this.turnHandle(1);
    });

    this.eventMode = "static";
    this.cursor = "pointer";

    this.on("pointertap", (event) => {
      const local = this.toLocal(event.global);
      const direction: TurnDirection = local.x < this.handle.x ? -1 : 1;
      void this.turnHandle(direction);
    });
  }

  async turnHandle(direction: TurnDirection) {
    await this.handle.turn(direction);

    const result = this.combinationManager.registerPlayerTurn(direction);
    console.log(`Result: "${result}"`);

    if (result === "FAIL") {
      await this.handle.handleFailure(direction);
      this.combinationManager.reset();
      return;
      
    } else if (result === "SUCCESS") {
      // TODO: handle success, open safe
    }
  }

  resize(width: number, height: number) {
    const bg = this.background.texture;
    const scale = Math.max(width / bg.width, height / bg.height);

    this.scale.set(scale);
    this.position.set(width / 2, height / 2);
  }
}
