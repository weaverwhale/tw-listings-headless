const { rename } = require("fs");

/**
 * @param {string} oldFileName 
 * @param {string} newFileName 
 */
module.exports = (oldFileName, newFileName) => new Promise((res, rej) => {
  rename(oldFileName, newFileName, (err) => {
    if (err) return rej(err);
    return res();
  });
})