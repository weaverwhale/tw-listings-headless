const path = require('path');
const readline = require('node:readline/promises');

const { promiseWriteFile } = require('../helpers/promiseWriteFile');
const { promiseGetFilesForDir } = require('../helpers/promiseGetFilesForDir');
const { getInputFromFile } = require('../helpers/getInputFromFile');
const { promiseReadFile } = require('../helpers/promiseReadFile');
const { generateIconsSprite } = require('../generate-icons-sprite/generate-icons-sprite');

(async () => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.on('SIGINT', () => {
    console.log('\nProcess terminated');
    process.exit();
  });

  try {
    const iconName = await rl.question(`Enter the icon's name: `);
    if (!iconName) throw new Error('No icon name provided!');

    const ccInput =
      (await rl.question('\nWould you like this icon to be color customizable? (Y/n): ')) || 'y';
    const removeColors = ccInput.toLowerCase() === 'y';

    const method = await rl.question(
      `\nHow would you like to enter your icon?` +
        `\nEnter either "content" or "filepath": ("content" only works if you have VSCode)\n`
    );
    if (method !== 'content' && method !== 'filepath') {
      throw new Error(`Invalid icon creation method - ${method}. Must be "content" or "filepath"`);
    }

    const svgsDir = path.resolve(__dirname, '../..', 'svgs');
    const constFile = path.resolve(__dirname, '../..', 'src/constants/icons.ts');

    let svgContent;
    if (method === 'filepath') {
      const filepath = await rl.question('\nEnter absolute filepath of svg: ');
      if (!filepath) throw new Error('No filepath provided!');

      svgContent = await promiseReadFile(filepath);
    } else {
      // create new icon file
      svgContent = await getInputFromFile(`Enter '${iconName}' svg content`);
    }

    console.log('Creating new svg file...');
    const newSvgFilePath = `${svgsDir}/${iconName}${removeColors ? '.nocolor' : ''}.svg`;
    await promiseWriteFile(newSvgFilePath, svgContent);

    // get icon files names
    const iconsFiles = await promiseGetFilesForDir(svgsDir);

    // save list of icon options as const
    const iconsOptions = iconsFiles
      .filter((f) => f !== 'sprites.svg' && f !== '.DS_Store')
      .map((f) => f.split('.')[0]);

    console.log(`Adding ${iconName} to const...`);
    const newIconsConst = `export const icons = [
  ${iconsOptions.map((f) => `'${f}'`).join(`,
  `)}
] as const;`;

    await promiseWriteFile(constFile, newIconsConst);

    await generateIconsSprite();

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
