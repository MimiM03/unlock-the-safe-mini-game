import gsap from "gsap";
import { Container, Sprite } from "pixi.js";
import Keyboard from "../core/Keyboard";
import { Handle, type TurnDirection } from "./Handle";
import { CombinationManager } from "../backend/CombinationManager";
import { Timer } from "../backend/Timer";
import { Text } from "pixi.js";
import config from "../config";

export default class Safe extends Container {
  private background: Sprite;
  private doorClosed: Sprite;
  private doorOpen: Sprite;
  private sparkles: Sprite[];
  private handle: Handle;
  private opened = false;
  private keyboard = Keyboard.getInstance();
  private combinationManager = new CombinationManager();
  private timer = new Timer();
  private timerText: Text;

  constructor() {
    super();

    this.background = Sprite.from("background");
    this.doorClosed = Sprite.from("doorClosed");
    this.doorOpen = Sprite.from("doorOpen");
    this.sparkles = [
      Sprite.from("shine"),
      Sprite.from("shine"),
      Sprite.from("shine"),
    ];
    this.handle = new Handle();

    this.background.anchor.set(0.5);
    this.doorClosed.anchor.set(1, 0.5);

    this.doorClosed.position.set(config.offsets.door.closed.x, config.offsets.door.closed.y);

    this.doorClosed.addChild(this.handle);
    this.handle.position.set(config.offsets.handle.x, config.offsets.handle.y);
    
    this.doorOpen.anchor.set(0, 0.5);
    this.doorOpen.position.set(config.offsets.door.open.x, config.offsets.door.open.y);
    this.doorOpen.visible = false;

    this.sparkles.forEach(sparkle => sparkle.anchor.set(0.5));
    this.sparkles[0].position.set(config.offsets.sparkles.top.x, config.offsets.sparkles.top.y);
    this.sparkles[1].position.set(config.offsets.sparkles.middle.x, config.offsets.sparkles.middle.y);
    this.sparkles[2].position.set(config.offsets.sparkles.bottom.x, config.offsets.sparkles.bottom.y);
    this.sparkles.forEach(sparkle => sparkle.visible = false);

    this.timerText = new Text("00:00:00", { fontSize: 20, fontWeight: "bold", fill: "white" });
    this.timerText.resolution = 2;
    this.timerText.position.set(config.offsets.timer.x, config.offsets.timer.y);
    this.timerText.anchor.set(0.5);
    this.timer.start();
    this.addChild(this.background, ...this.sparkles,this.doorClosed, this.doorOpen, this.timerText);

    this.setupInput();
  }

  private setupInput(): void {
    this.keyboard.onAction(({ action, buttonState }) => {
      if (buttonState !== "pressed") return;

      if (action === "LEFT") void this.turnHandle(-1);
      if (action === "RIGHT") void this.turnHandle(1);
    });

    this.eventMode = "static";
    this.cursor = "pointer";

    this.on("pointertap", (event) => {
      const local = this.toLocal(event.global);
      const handlePos = this.toLocal(this.handle.getGlobalPosition());
      const direction: TurnDirection = local.x < handlePos.x ? -1 : 1;
      void this.turnHandle(direction);
    });
  }

  async turnHandle(direction: TurnDirection): Promise<void> {
    if (this.opened) return;

    const turnedSuccessfully = await this.handle.turn(direction);
    if (!turnedSuccessfully) return;

    const result = this.combinationManager.registerPlayerTurn(direction);
    console.log(`Result: "${result}"`);

    if (result === "FAIL") {
      this.timer.stop();
      await this.handle.handleFailure(direction);
      this.combinationManager.reset();
      this.timer.start();
      return;

    } else if (result === "SUCCESS") {
      this.timer.stop();
      await this.handleSuccess();
      this.combinationManager.reset();
      this.timer.start();
      return;
    }
  }

  async handleSuccess(): Promise<void> {
    if (this.opened) return;

    this.opened = true;

    this.doorOpen.visible = true;
    this.doorOpen.alpha = 0;
    this.doorOpen.scale.x = 0.1;

    try {
      const tl = gsap.timeline();

      // Open the door
      tl.to(this.doorClosed.scale, {
        x: 0,
        duration: 2,
        ease: "power2.in",
      });

      tl.to(this.doorOpen, { alpha: 1, duration: 0.01, ease: "power2.out" }, 1.99);

      tl.to(this.doorOpen.scale, { x: 1, duration: 2, ease: "power2.out" }, 1.9);

      tl.add(() => {
        this.doorClosed.visible = false;
      });

      // Start sparkles while the door is still opening
      tl.add(() => {
        this.sparkles.forEach((sparkle, i) => {
          sparkle.visible = true;
          sparkle.alpha = 0.35;
          sparkle.scale.set(0.7);

          const delay = i * 0.15;

          gsap.to(sparkle, {
            alpha: 1,
            duration: 0.4,
            yoyo: true,
            repeat: -1,
            delay,
            ease: "sine.inOut",
          });

          gsap.to(sparkle.scale, {
            x: 1.4,
            y: 1.4,
            duration: 0.4,
            yoyo: true,
            repeat: -1,
            delay,
            ease: "sine.inOut",
          });
        });
      }, 0.6);

      await tl;

      // Keep twinkling for 5 seconds after the door is open
      await gsap.to({}, { duration: 5 });

      const tl2 = gsap.timeline();
      // Close the door
      tl2.add(() => {
        this.doorClosed.visible = true;
      });
      tl2.to(this.doorOpen.scale, { x: 0, duration: 2, ease: "power2.in" });
      tl2.to(this.doorOpen, { alpha: 0, duration: 0.01, ease: "power2.out" }, 1.99);
      tl2.to(this.doorClosed.scale, { x: 1, duration: 2, ease: "power2.out" }, 1.9);
      tl2.add(() => {
        this.doorOpen.visible = false;
      });

      await tl.add(tl2);

      // Stop the sparkles
      gsap.killTweensOf(this.sparkles);
      gsap.killTweensOf(this.sparkles.map((s) => s.scale));
      this.sparkles.forEach((s) => {
        s.visible = false;
      });
    } finally {
      this.opened = false;
    }
  }

  updateTimer(): void {
    if (!this.timer.isTimerRunning()) return;
    this.timerText.text = this.timer.formatTime();
  }

  resize(width: number, height: number): void {
    const bg = this.background.texture;
    const scale = Math.min(width / bg.width, height / bg.height);

    this.scale.set(scale);
    this.position.set(width / 2, height / 2);
  }
}
