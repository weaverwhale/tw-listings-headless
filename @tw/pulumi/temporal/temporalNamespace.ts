import * as pulumi from '@pulumi/pulumi';
import { Connection } from '@temporalio/client';
import { Duration } from '@temporalio/common/lib/time';
import { getTemporalClient } from './utils';
import { msToTs, tsToMs } from '@temporalio/common/lib/time';

interface TemporalNamespaceResourceInputs {
  projectId: string;
  serviceId: string;
  namespace: string;
  workflowExecutionRetentionPeriod?: Duration;
  description?: string;
}

const DEFAULT_RETENTION_PERIOD: Duration = '90 days';

class TemporalNamespaceProvider implements pulumi.dynamic.ResourceProvider {
  async create(
    inputs: TemporalNamespaceResourceInputs
  ): Promise<pulumi.dynamic.CreateResult<TemporalNamespaceResourceInputs>> {
    const {
      projectId,
      serviceId,
      namespace,
      description = null,
      workflowExecutionRetentionPeriod = DEFAULT_RETENTION_PERIOD,
    } = inputs;

    const client = await getTemporalClient({ projectId, serviceId });
    await client.workflowService.registerNamespace({
      namespace,
      description,
      workflowExecutionRetentionPeriod: msToTs(workflowExecutionRetentionPeriod),
    });
    return {
      id: inputs.namespace,
      outs: {
        projectId,
        serviceId,
        namespace,
        description,
        workflowExecutionRetentionPeriod,
      },
    };
  }

  async diff(
    _id,
    olds: TemporalNamespaceResourceInputs,
    news: TemporalNamespaceResourceInputs
  ): Promise<pulumi.dynamic.DiffResult> {
    const {
      namespace,
      description = null,
      workflowExecutionRetentionPeriod = DEFAULT_RETENTION_PERIOD,
    } = news;
    const equal =
      olds.namespace === namespace &&
      olds.description === description &&
      olds.workflowExecutionRetentionPeriod === workflowExecutionRetentionPeriod;
    const replaces = [];
    if (olds.namespace !== namespace) {
      replaces.push('namespace');
    }
    return { changes: !equal, replaces };
  }

  async update(
    _id,
    _olds: TemporalNamespaceResourceInputs,
    news: TemporalNamespaceResourceInputs
  ): Promise<pulumi.dynamic.UpdateResult<TemporalNamespaceResourceInputs>> {
    const {
      projectId,
      serviceId,
      namespace,
      description = null,
      workflowExecutionRetentionPeriod = DEFAULT_RETENTION_PERIOD,
    } = news;
    const client = await getTemporalClient({ projectId, serviceId });
    await client.workflowService.updateNamespace({
      namespace,
      updateInfo: {
        description,
      },
      config: {
        workflowExecutionRetentionTtl: msToTs(workflowExecutionRetentionPeriod),
      },
    });
    return {
      outs: {
        projectId,
        serviceId,
        namespace,
        description,
        workflowExecutionRetentionPeriod,
      },
    };
  }
  async read(
    _id: any,
    props: TemporalNamespaceResourceInputs
  ): Promise<pulumi.dynamic.ReadResult<TemporalNamespaceResourceInputs>> {
    const { projectId, serviceId } = props;
    const client = await getTemporalClient({ projectId, serviceId });
    const namespaces = await client.workflowService.listNamespaces({});
    const ns = namespaces.namespaces.find((n) => n.namespaceInfo.name === props.namespace);
    if (!ns) {
      return {};
    }

    return {
      id: ns.namespaceInfo.name,
      props: {
        projectId,
        serviceId,
        namespace: ns.namespaceInfo.name,
        description: ns.namespaceInfo.description,
        workflowExecutionRetentionPeriod: tsToMs(ns.config.workflowExecutionRetentionTtl),
      },
    };
  }

  async delete(_id, props: TemporalNamespaceResourceInputs): Promise<void> {
    const { projectId, serviceId } = props;
    const client = await getTemporalClient({ projectId, serviceId });
    const conn = client.connection as Connection;
    await conn.operatorService.deleteNamespace({
      namespace: props.namespace,
    });
  }
}

export class TemporalNamespace extends pulumi.dynamic.Resource {
  public readonly namespace!: pulumi.Output<string>;
  public readonly description!: pulumi.Output<string>;
  public readonly retentionPeriod: pulumi.Output<Duration>;
  constructor(
    name: string,
    args: TemporalNamespaceResourceInputs,
    opts?: pulumi.CustomResourceOptions
  ) {
    super(new TemporalNamespaceProvider(), name, args, opts, 'temporal', 'namespace');
  }
}

export function createTemporalNamespace(
  name: string,
  args: TemporalNamespaceResourceInputs,
  opts?: pulumi.CustomResourceOptions
) {
  const ns = new TemporalNamespace(name, args, opts);
  return ns;
}
