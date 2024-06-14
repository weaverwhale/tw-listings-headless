const fs = require('fs');
const { exec } = require('child_process');
const temp = require('temp').track();

async function main() {
  // Create a temporary file
  const tempFile = temp.path({ suffix: '.svg' });

  // Open the temporary file in VSCode
  await new Promise((resolve, reject) => {
    exec(`code --wait ${tempFile}`, (error) => {
      if (error) {
        console.error(`Error opening file with VSCode: ${error.message}`);
        reject(error);
        return;
      }
      resolve();
    });
  });

  return await new Promise((res, rej) => {
    fs.readFile(tempFile, (err, data) => {
      if (err) rej(err)
      res(data)
    })
  })
}

module.exports.getInputFromFile = (inputText) => {
  console.log(inputText + `\n`)
  return main();
}
