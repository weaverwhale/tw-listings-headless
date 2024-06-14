export function array2list(arr: string[]): string {
  const copy = [...arr];
  let str = copy.length > 1 ? 'and ' : '';
  str += copy.pop();
  while (copy.length) {
    str = copy.pop() + ', ' + str;
  }
  return str;
}
