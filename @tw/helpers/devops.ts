export function maybeAdd(str: string, add: string, mode: 'append' | 'prepend' = 'append') {
  if (!str) return '';
  if (mode == 'append') {
    return `${str}${add}`;
  }
  return `${add}${str}`;
}
