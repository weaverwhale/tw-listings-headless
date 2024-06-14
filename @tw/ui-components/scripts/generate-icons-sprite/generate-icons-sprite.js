const path = require('path');
const { glob } = require('glob');
const { generateSvgSprite, writeIfChanged, createIfDoesntExist } = require('./helpers');

module.exports.generateIconsSprite = async () => {
  const currentPath = process.cwd();
  const inputDir = path.resolve(__dirname, '../..', 'svgs');
  const outputDir = path.resolve(__dirname, '../..', 'src', 'assets', 'icons', 'svg');

  const files = glob.sync('**/*.svg', { cwd: inputDir }).sort((a, b) => a.localeCompare(b));

  if (files.length === 0) {
    console.log(`No SVG files found in ${inputDir}`);
    process.exit(0);
  }

  const outputPath = path.join(outputDir, 'sprite.symbol.svg');
  await createIfDoesntExist(outputPath)

  console.log(`Generating sprite for ${path.relative(currentPath, inputDir)}`);

  const spritesheetContent = await generateSvgSprite({
    files,
    inputDir,
  });

  await writeIfChanged(outputPath, spritesheetContent);
};