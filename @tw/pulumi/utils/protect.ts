import * as pulumi from '@pulumi/pulumi';

class Protect extends pulumi.dynamic.Resource {
  constructor(name: string, props: {}, opts?: pulumi.CustomResourceOptions) {
    super(protectProvider, name, props, opts);
  }
}

const protectProvider: pulumi.dynamic.ResourceProvider = {
  async create(inputs) {
    return { id: 'foo', outs: {} };
  },
};

export function protect(name, protect) {
  new Protect(name, {}, { protect });
}
