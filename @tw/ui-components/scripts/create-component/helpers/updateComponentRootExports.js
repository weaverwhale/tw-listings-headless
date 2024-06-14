const { readFileSync } = require('fs');

module.exports.updateComponentRootExports = (rootFilePath, componentName) => {
  const data = readFileSync(rootFilePath).toString();
  return data + `
export * from './${componentName}/${componentName}';`;
};
