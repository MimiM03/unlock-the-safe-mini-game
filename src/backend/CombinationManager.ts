import { TurnDirection } from "../prefabs/Handle";

export interface CombinationPair {
  num: number; // 1-9
  direction: TurnDirection; // CW (1) or CCW (-1)
}; 

export class CombinationManager {
  private combinations: CombinationPair[] = [];
  private currentIndex: number = 0;
  private currentNumProgress: number = 0;

  constructor() {
    this.generateSecretCombination();
  }

  public generateSecretCombination(){
    let currentDirection: TurnDirection = Math.random() > 0.5 ? 1 : -1;

    for (let i = 0; i < 3; i++) {
      let currentNum = Math.floor(Math.random() * 9) + 1;
      this.combinations.push({num: currentNum, direction: currentDirection});
      currentDirection = currentDirection === 1 ? -1 : 1;
    }

    const formattedCode = this.combinations
      .map((pair) => `${pair.num} ${pair.direction}`)
      .join(", ");

    console.log(`Secret Combination: "${formattedCode}"`);
  }

  public registerPlayerTurn(inputDirection: TurnDirection): "FAIL" | "PAIR_COMPLETED" | "SUCCESS" | "IN_PROGRESS" {
    let currentCombination = this.combinations[this.currentIndex];

    if (currentCombination.direction !== inputDirection) {
      return "FAIL";
    }

    this.currentNumProgress++;
    if (this.currentNumProgress === currentCombination.num) {
      this.currentIndex++;
      this.currentNumProgress = 0;

      if (this.currentIndex === this.combinations.length) {
        return "SUCCESS";
      }

      return "PAIR_COMPLETED";
    }

    if (this.currentNumProgress > currentCombination.num) {
      return "FAIL";
    }

    return "IN_PROGRESS";
  }

  public reset(){
    this.combinations = [];
    this.currentIndex = 0;
    this.currentNumProgress = 0;
    this.generateSecretCombination();
  }
}