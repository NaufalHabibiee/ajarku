declare module "player.js" {
  export class Player {
    constructor(element: HTMLIFrameElement | string);
    on(event: string, callback: (value?: unknown) => void): void;
    off(event: string): void;
    play(): void;
    pause(): void;
    getCurrentTime(cb: (seconds: number) => void): void;
    setCurrentTime(seconds: number): void;
    getDuration(cb: (seconds: number) => void): void;
    isReady?: boolean;
  }
  const playerjs: { Player: typeof Player };
  export default playerjs;
}
