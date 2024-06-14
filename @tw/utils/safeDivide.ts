export function safeDivide(numerator: number, denominator: number) {
  if (!numerator || !denominator) {
    return 0;
  }
  if (!isFinite(numerator) || !isFinite(denominator)) {
    return 0;
  }
  return (numerator / denominator) || 0;
}
