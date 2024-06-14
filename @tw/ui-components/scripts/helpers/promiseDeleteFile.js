const { unlink } = require('fs')

/**
 * @description Asynchronously deletes a file by file path
 * @param {string} filePath 
 * @returns {Promise<void>}
 */
module.exports.promiseDeleteFile = (filePath) =>
  new Promise((res, rej) => {
    unlink(filePath, (err) => {
      if (err) rej(err);
      res(`File "${filePath}" deleted successfully`)
    });
  });
