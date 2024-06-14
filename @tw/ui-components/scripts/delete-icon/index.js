const path = require('path');
const readline = require('node:readline/promises');

const { promiseWriteFile } = require('../helpers/promiseWriteFile');
const { promiseDeleteFile } = require('../helpers/promiseDeleteFile');
const { generateIconsSprite } = require('../generate-icons-sprite/generate-icons-sprite');
const { getExistingIconsWithMetadata } = require('../generate-icons-sprite/helpers');
const { promiseReadFile } = require('../helpers/promiseReadFile');

(async () => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.on('SIGINT', () => {
    console.log('\nProcess terminated');
    process.exit();
  });

  try {
    const iconName = await rl.question(`Enter the icon's name: `);
    if (!iconName) throw new Error('No icon name provided!');

    const svgsDir = path.resolve(__dirname, '../..', 'svgs');
    const constFile = path.resolve(__dirname, '../..', 'src/constants/icons.ts');

    // get icon files names
    const iconsMap = await getExistingIconsWithMetadata();
    if (!iconsMap.has(iconName)) {
      throw new Error(`Icon with name ${iconName} doesn't exist.`)
    }

    const confirmed = await rl.question(`Are you sure you want to delete this icon? (y/N)`)
    if (!confirmed || confirmed.toLowerCase() !== 'y') {
      console.log('Process exited successfully')
      process.exit();
    }

    // delete the corresponding icon svg file
    const fileSuffix = (iconsMap.get(iconName) ? '.nocolor' : '') + '.svg'
    await promiseDeleteFile(path.join(svgsDir, iconName + fileSuffix));

    // remove icon
    console.log(`Removing ${iconName} from const...`);
    iconsMap.delete(iconName);
    const newIconsConst = `export const icons = [
  ${[...iconsMap.keys()].map((f) => `'${f}'`).join(`,
  `)}
] as const;
`;
    await promiseWriteFile(constFile, newIconsConst);

    // regenerate sprite
    await generateIconsSprite();

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
