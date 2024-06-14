const { readFile } = require('fs')

/**
 * @param  {...any} args 
 * @returns {Promise<string>}
 */
module.exports.promiseReadFile = (...args) =>
  new Promise((res, rej) => {
    readFile(args[0], args[1], (err, data) => {
      if (err) return rej(err);
      return res(data.toString());
    });
  });
