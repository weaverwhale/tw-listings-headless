export const mergeAndSumObjectsToNumbersOnly: any = (objects: any[]) => {
  const res = {};
  objects.forEach((obj) => {
    Object.entries(obj).forEach(([key, value]) => {
      if (isNaN(Number(value))) {
        return;
      }
      if (!res[key]) {
        res[key] = 0;
      }
      res[key] += Number(value) || 0;
    });
  });
  return res;
};
