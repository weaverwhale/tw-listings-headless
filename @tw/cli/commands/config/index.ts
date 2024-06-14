import { configStore } from '../../utils/configstore';

function getKey(key) {
  return `${process.env.PROJECT_ID}:${key}`;
}

export function get(key) {
  return configStore.get(getKey(key));
}

export function set(key, value) {
  return configStore.set(getKey(key), value);
}
