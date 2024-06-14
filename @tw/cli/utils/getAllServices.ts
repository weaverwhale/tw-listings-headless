import * as fs from 'fs';
import { ServicesIds } from '@tw/types/module/services/';
import { serviceExits } from './fs';
import { cliConfig } from '../config';

export async function getAllServices(): Promise<ServicesIds[]> {
  const services: unknown = fs
    .readdirSync(cliConfig.servicesRoot)
    .filter((service) => serviceExits(`${cliConfig.servicesRoot}/${service}`));
  return services as ServicesIds[];
}
