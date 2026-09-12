import { Text } from "pixi.js";
import Scene from "../core/Scene";
import { centerObjects } from "../utils/misc";

export default class Loading extends Scene {
  name = "Loading";

  async load() {
    const text = new Text("Loading...", {
      fontFamily: "Verdana",
      fontSize: 50,
      fill: "white",
    });

    text.resolution = 2;
    centerObjects(text);
    this.addChild(text);
  }

  async start() {
    await this.utils.assetLoader.loadAssetsGroup("Game");
  }
}
