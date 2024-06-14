import chalk from 'chalk';

export const chalkError = chalk.hex('#f44336');
export const chalkWarning = chalk.hex('#fafa23');
export const chalkLog = chalk.hex('#03cafc');
export const chalkSuccess = chalk.hex('#4BB543');

export function cliError(error: string) {
  console.error(`${chalkError(error)}`);
}

export function cliWarning(error: string) {
  console.warn(`${chalkWarning(error)}`);
}

export function cliLog(message: string) {
  console.error(`${chalkLog(message)}`);
}

export function cliSuccess(message: string) {
  console.error(`${chalkSuccess(message)}`);
}
