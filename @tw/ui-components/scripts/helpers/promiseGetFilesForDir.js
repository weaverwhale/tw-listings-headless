const fs = require('fs');
const path = require('path');

/**
 * @param {string} directoryPath
 * @returns {Promise<string>}
 */
module.exports.promiseGetFilesForDir = (directoryPath) =>
  new Promise((res, rej) => {
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        console.error('Error reading directory:', err);
        rej();
      }

      const fileList = files.filter((file) => fs.statSync(path.join(directoryPath, file)).isFile());
      res(fileList);
    });
  });
