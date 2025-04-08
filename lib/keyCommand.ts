type Keys = typeof import('./keys.js')

export interface KeyCommand {
  command: string
  name: string
}

type KeyNameInterface<T extends Record<string, KeyCommand>> = Record<
  T[keyof T]['command'],
  any
>

export type KeyName = keyof KeyNameInterface<Keys>

export type KeyType = KeyCommand | string

export function getCommand(key: KeyType): string {
  if (typeof key === 'string') {
    return key
  }
  return key.command
}
