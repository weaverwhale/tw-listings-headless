import * as pulumi from '@pulumi/pulumi';
import axios from 'axios';

export interface TwGatewayResourceInputs {
  serviceId: pulumi.Input<string>;
  spec: pulumi.Input<any>;
}

interface TwGatewayInputs {
  serviceId: string;
  spec: any;
}

const url = 'http://localhost/tw-gateway/service';

const twGatewayProvider: pulumi.dynamic.ResourceProvider = {
  async create(inputs: TwGatewayInputs) {
    const serviceId = inputs.serviceId;
    const res = (await axios.post(`${url}/${serviceId}`, inputs)).data;
    return { id: res.id.toString(), outs: res.data };
  },
  async update(id, _olds: TwGatewayInputs, news: TwGatewayInputs) {
    const res = (await axios.post(`${url}/${id}`, news)).data;
    return { outs: res.data };
  },
  // async delete(id, props: TwGatewayInputs) {
  //   const ocktokit = new Ocktokit({ auth });
  //   await ocktokit.issues.deleteLabel(props);
  // },
};

export class TwGateway extends pulumi.dynamic.Resource {
  constructor(name: string, args: TwGatewayResourceInputs, opts?: pulumi.CustomResourceOptions) {
    super(twGatewayProvider, name, args, opts);
  }
}
