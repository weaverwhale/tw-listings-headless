import { projectIds } from '@tw/constants';
import { selectGeneric } from './genericSelect';

export async function selectProjects() {
  return selectGeneric({
    multi: true,
    message: 'Choose the projects',
    choices: projectIds,
  });
}
