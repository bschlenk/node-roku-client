export function maybeBoolean(str: string): string | boolean {
  if (str === 'true') return true;
  if (str === 'false') return false;
  return str;
}

export function camelcase(str: string): string {
  const [first, ...rest] = str.split(/[-_]/);
  return first + rest.map(capitalize).join('');
}

export function capitalize(str: string): string {
  return str[0].toUpperCase() + str.substr(1);
}

