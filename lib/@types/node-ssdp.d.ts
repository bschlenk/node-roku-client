type EventEmitter = typeof import('node:events')

declare module 'node-ssdp' {
  export interface Headers {
    SERVER: string
    LOCATION: string
  }

  class Client {
    constructor()
    stop(): void
    on(event: 'response', fn: (headers: Headers) => void): void
    search(query: string): void
  }

  export default { Client }
}
