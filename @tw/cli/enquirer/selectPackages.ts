import { getAllPackages } from '../utils/getAllPackages';
import { selectGeneric } from './genericSelect';

export async function selectPackages() {
  return selectGeneric({
    multi: true,
    message: 'Choose the packages',
    choices: getAllPackages,
  });
}
