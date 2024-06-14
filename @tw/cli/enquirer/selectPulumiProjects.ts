import { getAllPulumiProjects } from '../utils/getAllPulumiProjects';
import { selectGeneric } from './genericSelect';

export async function selectPulumiProjects() {
  return selectGeneric({
    multi: true,
    message: 'Choose the pulumi projects',
    choices: getAllPulumiProjects,
  });
}
