import { getAllPipelines } from '../utils/getAllPipelines';
import { selectGeneric } from './genericSelect';

export async function selectPipelines(multi: boolean = true) {
  return selectGeneric({
    multi,
    message: multi ? 'Choose the pipelines' : 'Which pipeline?',
    choices: getAllPipelines,
  });
}
