type JSXClass = React.HTMLAttributes<HTMLElement>['className'] & NonNullable<unknown>;
type ConditionalClass = boolean | undefined | null;
type CxClass = ConditionalClass | JSXClass | { [className: string]: boolean } | CxClass[];

/**
 * @description Utility function used to combine classes into a string.
 * Can help make conditional rendering more brief and less troublesome
 * instead of using template strings.
 */
export function cx(...classes: CxClass[]): string {
  const classList: string[] = [];

  for (const cls of classes) {
    if (Array.isArray(cls)) {
      classList.push(cx(...cls));
      continue;
    }

    if (typeof cls !== 'object' || !cls) {
      if (typeof cls !== 'string') continue;

      classList.push(cls);
      continue;
    }

    for (const className in cls) {
      if (cls[className]) {
        classList.push(className);
      }
    }
  }

  return classList.join(' ');
}
