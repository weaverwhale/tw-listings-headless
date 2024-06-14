import { sync as commandExistsSync } from 'command-exists';
import { cliError } from './logs';
import { exit } from 'process';
import { cliExit } from './exit';

let python;
let pip;

export async function getPythonCommand() {
  if (python) {
    return python;
  }
  if (commandExistsSync('python')) {
    python = 'python';
  } else if (commandExistsSync('python3.10')) {
    // 11 is not widely supported yet
    python = 'python3.10';
  } else if (commandExistsSync('python3')) {
    python = 'python3';
  } else {
    cliExit('Could not find python or python3, trying to install python3.');
  }
  return python;
}

export async function getPipCommand() {
  if (pip) {
    return pip;
  }
  if (commandExistsSync('pip')) {
    pip = 'pip';
  } else if (commandExistsSync('pip3')) {
    pip = 'pip3';
  } else {
    cliExit('Could not find pip or pip3, trying to install pip3.');
  }
  return pip;
}
