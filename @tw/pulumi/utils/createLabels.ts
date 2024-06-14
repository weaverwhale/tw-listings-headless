import { getConfigs } from './getConfigs';

export function createLabels(asArray: boolean = false): any {
  let labels = {
    'pulumi-project': getConfigs().serviceId,
    'pulumi-stack': getConfigs().stack,
  };
  if (getConfigs().isAService) {
    labels['service-id'] = getConfigs().serviceId;
  }
  if (asArray === true) {
    return Object.entries(labels).map(([key, value]) => `${key}:${value}`);
  }
  return labels;
}

export const OMIT_LABELS = Symbol('OMIT_LABELS');
export function omitLabels() {
  return { [OMIT_LABELS]: true };
}

export function shouldOmitLabels(labels: any) {
  return labels && labels[OMIT_LABELS] === true;
}
