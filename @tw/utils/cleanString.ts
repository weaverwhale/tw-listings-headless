export function cleanString(val: any) {
  if (typeof val === 'string') {
    return val
      .replaceAll('\\\\u0000', '')
      .replaceAll('\\u0000', '')
      .replaceAll('\u0000', '')
      .trim();
  } else if (typeof val === 'number') {
    return val;
  } else {
    return val || null;
  }
}
