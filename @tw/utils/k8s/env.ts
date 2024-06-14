import * as fs from 'fs';

const podInfo = {};

const mount = '/etc/podinfo';

export function getK8sPodInfo() {
  if (Object.keys(podInfo).length) return podInfo;
  try {
    const labels = envToObject(fs.readFileSync(`${mount}/labels`).toString());
    const annotations = envToObject(fs.readFileSync(`${mount}/annotations`).toString());
    podInfo['labels'] = labels;
    podInfo['annotations'] = annotations;
  } catch {}
  return podInfo;
}

function envToObject(envString: string) {
  const result = {};
  envString.split('\n').map((line) => {
    const [key, value] = line.split('=', 2);
    if (key && value) {
      result[key] = value;
    }
  });
  return result;
}
