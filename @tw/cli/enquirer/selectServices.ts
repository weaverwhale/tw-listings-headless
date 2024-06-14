import { getAllServices } from '../utils/getAllServices';
import { selectGeneric } from './genericSelect';

export async function selectServices(multi: boolean = true) {
  return selectGeneric({
    multi,
    message: multi ? 'Choose the services' : 'Which service?',
    choices: getAllServices,
  });
}
