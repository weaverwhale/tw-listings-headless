const path = require('path');
const readline = require('node:readline/promises');

const { promiseWriteFile } = require('../helpers/promiseWriteFile');
const { promiseReadFile } = require('../helpers/promiseReadFile');
const { generateIconsSprite } = require('../generate-icons-sprite/generate-icons-sprite');
const promiseRenameFile = require('../helpers/promiseRenameFile');
const { getExistingIconsWithMetadata } = require('../generate-icons-sprite/helpers');

(async () => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.on('SIGINT', () => {
    console.log('\nProcess terminated');
    process.exit();
  });

  try {
    const constFile = path.resolve(__dirname, '../..', 'src/constants/icons.ts');
    const [constFileContent, iconsOptions] = await Promise.all([
      promiseReadFile(constFile),
      getExistingIconsWithMetadata(),
    ]);

    // get old icon name
    let oldName = await rl.question("Enter the icon's old name:\n");
    while (!oldName || !iconsOptions.has(oldName)) {
      const question = !oldName
        ? 'Enter a valid name:\n'
        : `Name "${oldName}" doesn't exist. Choose a name that exists:\n`;
      oldName = await rl.question(question);
    }

    // get new icon name
    let newName = await rl.question("Enter the icon's new name:\n");
    while (!newName || iconsOptions.has(newName)) {
      const question = !newName
        ? 'Enter a valid name:\n'
        : `Name "${newName}" is already taken. Choose another:\n`;
      newName = await rl.question(question);
    }

    // get file for old icon
    const fileSuffix = `${iconsOptions.get(oldName) ? '.nocolor' : ''}.svg`;
    const oldSvgFile = path.resolve(__dirname, '../..', 'svgs', oldName + fileSuffix);
    const newSvgFile = path.join(__dirname, '../..', 'svgs', newName + fileSuffix);
    await Promise.all([
      promiseRenameFile(oldSvgFile, newSvgFile),
      promiseWriteFile(constFile, constFileContent.replace(oldName, newName)),
    ]);

    // after rename, must regenerate sprite, so id for name will exist in sprite
    await generateIconsSprite();

    console.log('Rename successfully completed');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
