import * as pulumi from '@pulumi/pulumi';
import * as kubernetes from '@pulumi/kubernetes';

export function sortEnvs(
  envs: { name: pulumi.Input<string>; value?: pulumi.Input<string>; valueFrom?: any }[]
) {
  // sort and remove empty values, and duplicate values
  return envs
    .filter(
      (env) =>
        (env.value !== '' &&
          env.value !== undefined &&
          env.value !== null &&
          env.value !== 'undefined') ||
        env.valueFrom
    )
    .filter((env, index, self) => {
      const firstIndex = self.findIndex((e) => e.name === env.name);
      return firstIndex === index;
    })
    .sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      return 1;
    });
}

export function addEnvIfNotExists(
  envs: kubernetes.types.input.core.v1.EnvVar[],
  env: kubernetes.types.input.core.v1.EnvVar
) {
  if (
    !envs.find((e) => {
      e.name === env.name;
    })
  ) {
    envs.push(env);
  }
}
