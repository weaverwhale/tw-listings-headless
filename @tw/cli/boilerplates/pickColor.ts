import chalk from 'chalk';
import { select } from '@inquirer/prompts';
import type { Logger } from './log';

export async function pickColor(humanName: string, logger: Logger): Promise<string> {
  const hex = await select({
    message: 'Pick a nice color:',
    choices: colors256Hex.map((hex, i) => ({
      name: chalk.hex(hex)(humanName),
      value: hex,
    })),
    pageSize: 20,
  });
  logger.setColor(hex);
  logger.setName(humanName);
  return '' + hex;
}

type RGB = [number, number, number];

const values = [0, 95, 135, 175, 215, 255];
const basicColors: RGB[] = Array.from(
  { length: 7 },
  (_, i) =>
    Number(i)
      .toString(2)
      .padStart(3, '0')
      .split('')
      .reverse()
      .map((c) => (c === '1' ? 128 : 0)) as RGB
).concat([
  [192, 192, 192],
  [128, 128, 128],
]);
const brightColors = Array.from(
  { length: 7 },
  (_, i) =>
    Number(i + 1)
      .toString(2)
      .padStart(3, '0')
      .split('')
      .reverse()
      .map((c) => (c === '1' ? 255 : 0)) as RGB
);
const xtermColors: RGB[] = values
  .map((r) => values.map((g) => values.map((b) => [r, g, b] as RGB)))
  .flat(2);
const xtermGreys: RGB[] = Array.from({ length: 24 }, (_, i) => 8 + 10 * i).map(
  (v) => [v, v, v] as RGB
);

const colors256rgb: RGB[] = basicColors.concat(brightColors).concat(xtermColors).concat(xtermGreys);

const colors256Hex: string[] = colors256rgb.map(rgb2Hex);

function rgb2Hex(rgb: RGB) {
  return rgb
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}
