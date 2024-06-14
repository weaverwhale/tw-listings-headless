import { Step } from './schema/workflows';

export function decodeArgsFromTrigger(args: {
  name: string;
  inputKey: string;
  resultsKey: string;
}): {
  [k: string]: Step;
} {
  const { name, inputKey, resultsKey } = args;

  return {
    [name]: {
      try: {
        assign: [
          {
            [resultsKey]: `\${json.decode(text.decode(base64.decode(${inputKey}.data.message.data)))}`,
          },
        ],
      },
      except: {
        as: 'e',
        steps: [
          {
            [`${name}-fallback`]: {
              assign: [
                {
                  [resultsKey]: `\${${inputKey}}`,
                },
              ],
            },
          },
        ],
      },
    },
  };
}
