export function separate(str: string): string[] {
  return str
    .split(/(?=[A-Z])/)
    .map((sub) => sub.split(/[\(\s\)\-_]/))
    .flat()
    .filter(Boolean)
    .map((s) => s.toLowerCase());
}

export function capitalize(str: string): Capitalize<string> {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<string>;
}

export function camel(str: string): string {
  return separate(str)
    .map((s, i) => (i === 0 ? s : capitalize(s)))
    .join('') as `${string}${Capitalize<string>}`;
}

export function pascal<S extends string = string>(str: S): Capitalize<S> {
  return separate(str).map(capitalize).join('') as Capitalize<S>;
}

export function kebab(str: string): string {
  return separate(str).join('-');
}

export function snake(str: string): string {
  return separate(str).join('_');
}
