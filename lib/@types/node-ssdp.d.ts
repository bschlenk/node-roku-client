declare module 'node-ssdp' {
  export interface Headers {
    SERVER: string;
    LOCATION: string;
  }

  export class Client {
    constructor();
    stop(): void;
    on(event: string, callback: (...args: any[]) => void): void;
    search(query: string): void;
  }
}
