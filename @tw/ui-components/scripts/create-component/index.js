const fs = require('fs')
const path = require('path')

const { generateComponentTemplateFile } = require('./helpers/generateComponentTemplateFile')
const { generateComponentStorybookTemplateFile } = require('./helpers/generateComponentStorybookTemplateFile')
const { promiseWriteFile } = require('../helpers/promiseWriteFile')
const { updateComponentRootExports } = require('./helpers/updateComponentRootExports')

const componentName = process.argv[2];

(async () => {
  try {
    if (!componentName) {
      throw new Error('No argument provided for component name');
    }

    const componentsDir = path.resolve(__dirname, '../..', 'src/components')
    const newDirPath =  componentsDir + `/${componentName}`;
    const componentRootPath = componentsDir + '/index.ts';
    fs.mkdirSync(newDirPath);

    await Promise.all([
      promiseWriteFile(
        newDirPath + `/${componentName}.tsx`,
        generateComponentTemplateFile(componentName)
      ),
      promiseWriteFile(
        newDirPath + `/${componentName}.stories.tsx`,
        generateComponentStorybookTemplateFile(componentName)
      ),
      promiseWriteFile(
        componentRootPath,
        updateComponentRootExports(componentRootPath, componentName)
      ),
    ]);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
