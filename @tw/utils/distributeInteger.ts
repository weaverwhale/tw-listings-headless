export const distributeInteger = (_total: number, divider: number): number[] => {
  const group: number[] = [];
  if (divider === 0) {
    group.push(0);
  } else {
    let sign = _total >= 0 ? 1 : -1;
    let total = Math.abs(_total);
    let rest = total % divider;
    let result = total / divider;

    for (let i = 0; i < divider; i++) {
      if (rest-- > 0) {
        group.push(Math.ceil(result) * sign);
      } else {
        group.push(Math.floor(result) * sign);
      }
    }
  }
  return group;
};
