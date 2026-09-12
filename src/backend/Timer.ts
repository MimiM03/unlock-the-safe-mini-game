export class Timer {
  private startTime: number = 0;
  private isRunning: boolean = false;

  public start() {
    this.startTime = performance.now();
    this.isRunning = true;
  }

  public stop(): void {
    this.isRunning = false;
  }

  public getTime(): number {
    return performance.now() - this.startTime;
  }

  public formatTime(): string {
    const totalMs = this.getTime();
  
    const minutes = Math.floor(totalMs / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const ms = Math.floor((totalMs % 1000) / 10);
  
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    const mss = String(ms).padStart(2, "0"); 
  
    return `${mm}:${ss}:${mss}`;
  }

  public isTimerRunning(): boolean {
    return this.isRunning;
  }
}