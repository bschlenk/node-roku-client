export function maybeBoolean(str: string): string | boolean {
  if (str === 'true') return true;
  if (str === 'false') return false;
  return str;
}

