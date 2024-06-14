import Configstore from 'configstore';
import { packageJson } from '../constants';

export const configStore = new Configstore(packageJson.name);
