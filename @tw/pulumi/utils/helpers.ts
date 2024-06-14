export function convertEnvs(envs) {
  return envs
    ? Object.keys(envs)
        .filter((k) => k !== 'PORT')
        .map((k) => {
          // check if is pulumi output
          let v = envs[k];
          if (!(v instanceof Object && v.apply)) {
            v = String(v);
          }
          return { name: k, value: v };
        })
    : [];
}
