export const fromJsonArrayToJsonL = (jsonArray: any[]): string => {
  return jsonArray.map((x) => JSON.stringify(x)).join('\n');
};

export const fromJsonLToJsonArray = (jsonl: string): any[] => {
  return jsonl.split('\n').map(x=>JSON.parse(x))
};
