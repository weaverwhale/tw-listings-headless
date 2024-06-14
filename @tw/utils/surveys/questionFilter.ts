import { surveyResponseAtomicTokens, surveyResponseTokens } from './surveyResponseTokens';

export function isCollectableQuestion(respOptions: string[]): boolean {
  let arr = respOptions.map((r) => r.toLowerCase().replace(/ /g, ''));
  let found = surveyResponseTokens.some((x) => arr.some((a) => a.indexOf(x) >= 0));
  if (found) return true;

  arr = respOptions.map((r) => r.toLowerCase());
  return surveyResponseAtomicTokens.some((t) =>
    arr.some((a) => {
      return (
        a === t || a.startsWith(t + ' ') || a.endsWith(' ' + t) || a.indexOf(' ' + t + ' ') >= 0
      );
    })
  );
}
