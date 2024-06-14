import { ServiceConfig } from '@tw/types';

export type ServiceData = {
  secrets: any;
  id: string;
  config: ServiceConfig;
  serviceDir: string;
  absolutePath: string;
  linkedPackages: string[];
  servicePort: number;
  userEnv: any;
};

export type Services = { [k: string]: ServiceData };
