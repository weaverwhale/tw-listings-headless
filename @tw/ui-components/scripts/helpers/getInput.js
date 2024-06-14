
const readline = require('readline');
const readlineSync = require('readline-sync');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

module.exports.getInput = (inputText) =>
  new Promise((res, rej) => {
    rl.question(`${inputText}\n`, (input) => {
      res(input);
    });
  });


module.exports.getMultilineInput = (inputText) =>
  new Promise((resolve, reject) => {
    const lines = [];

    function readLine() {
      const message = lines.length === 0 ? `${inputText}. (press q to finish):\n` : '';
      rl.question(message, (line) => {
        if (line === 'q') {
          rl.close();
          resolve(lines.join('\n'));
        } else {
          lines.push(line);
          readLine();
        }
      });
    }

    readLine();
  });