const { writeFile } = require('fs')

/**
 * @param {string} filePath 
 * @param {string} content 
 */
module.exports.promiseWriteFile = (filePath, content) =>
  new Promise((res, rej) => {
    writeFile(filePath, content, (err) => {
      if (err) return rej(err);
      return res();
    });
  });
