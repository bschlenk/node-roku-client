export function camelcase(str: string): string {
  const [first, ...rest] = str.split(/[-_]/)
  return first + rest.map(capitalize).join('')
}

export function capitalize(str: string): string {
  return str[0].toUpperCase() + str.substr(1)
}

export type QueryStringObj = Record<string, string | number | boolean>

export function queryString(obj: QueryStringObj): string {
  return Object.entries(obj)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join('&')
}

export function wait(timeout: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeout))
}
