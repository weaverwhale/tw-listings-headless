import * as fs from 'fs';
import { cliConfig } from '../config';
import { serviceExits } from './fs';

export async function getAllPipelines() {
  return fs
    .readdirSync(cliConfig.pipelinesRoot)
    .filter((service) => serviceExits(`${cliConfig.pipelinesRoot}/${service}`));
}
