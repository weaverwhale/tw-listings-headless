import * as pulumi from '@pulumi/pulumi';
import { getTemporalClient, getSchedule } from './utils';
import {
  ScheduleDescription,
  ScheduleOptions,
  ScheduleUpdateOptions,
  ScheduleOptionsStartWorkflowAction,
} from '@temporalio/client';
import isequal from 'lodash.isequal';

interface TemporalScheduleResourceInputs extends ScheduleOptions {
  namespace: pulumi.Input<string>;
  projectId: pulumi.Input<string>;
  serviceId: pulumi.Input<string>;
}

interface TemporalScheduleResourceProviderInputs extends ScheduleOptions {
  namespace: string;
  projectId: string;
  serviceId: string;
}

class TemporalScheduleProvider implements pulumi.dynamic.ResourceProvider {
  async create(
    inputs: TemporalScheduleResourceProviderInputs
  ): Promise<pulumi.dynamic.CreateResult<TemporalScheduleResourceProviderInputs>> {
    const { namespace, projectId, serviceId } = inputs;
    const client = await getTemporalClient({ namespace, projectId, serviceId });
    await client.schedule.create(inputs);

    return { id: inputs.scheduleId, outs: inputs };
  }

  async diff(
    _id: pulumi.ID,
    oldsWithProvider: TemporalScheduleResourceProviderInputs,
    newsWithProvider: TemporalScheduleResourceProviderInputs
  ): Promise<pulumi.dynamic.DiffResult> {
    const { __provider: __provider_old, ...olds } = oldsWithProvider as any;
    const { __provider: __provider_new, ...news } = newsWithProvider as any;
    const equal = isequal(olds, news);
    const replaces = [];
    if (olds.namespace !== news.namespace) {
      replaces.push('namespace');
    }
    if (olds.scheduleId !== news.scheduleId) {
      replaces.push('scheduleId');
    }

    return {
      changes: !equal,
      replaces,
    };
  }

  async update(
    _id,
    olds: TemporalScheduleResourceProviderInputs,
    news: TemporalScheduleResourceProviderInputs
  ): Promise<pulumi.dynamic.UpdateResult<TemporalScheduleResourceProviderInputs>> {
    const { projectId, namespace, serviceId } = olds;
    const client = await getTemporalClient({ namespace, projectId, serviceId });
    const handle = client.schedule.getHandle(olds.scheduleId);

    function updateFn(
      previous: ScheduleDescription
    ): ScheduleUpdateOptions<ScheduleOptionsStartWorkflowAction<any>> {
      return {
        state: previous.state,
        ...news,
      };
    }

    handle.update(updateFn);
    return { outs: news };
  }

  async read(
    _id: any,
    props: TemporalScheduleResourceProviderInputs
  ): Promise<pulumi.dynamic.ReadResult<TemporalScheduleResourceProviderInputs>> {
    const { projectId, scheduleId, namespace, serviceId } = props;
    const scheduleDetails = await getSchedule({
      scheduleId,
      namespace,
      projectId,
      serviceId,
    });
    if (!scheduleDetails) {
      return {};
    }
    const ret: TemporalScheduleResourceProviderInputs = {
      projectId,
      serviceId,
      namespace,
      scheduleId: scheduleDetails.scheduleId,
      spec: scheduleDetails.spec,
      action: scheduleDetails.action,
      policies: scheduleDetails.policies,
      memo: scheduleDetails.memo,
      searchAttributes: scheduleDetails.searchAttributes,
      state: scheduleDetails.state,
    };
    replaceUndefinedWithNull(ret);

    return { id: scheduleDetails.scheduleId, props: ret };
  }

  async delete(id: string, props: TemporalScheduleResourceProviderInputs): Promise<void> {
    const { namespace, scheduleId, projectId, serviceId } = props;
    const client = await getTemporalClient({ namespace, projectId, serviceId });
    client.schedule.getHandle(scheduleId).delete();
  }
}

export class TemporalSchedule extends pulumi.dynamic.Resource {
  public readonly name!: pulumi.Output<string>;
  public readonly args!: pulumi.Output<string>;
  constructor(
    name: string,
    args: TemporalScheduleResourceInputs,
    opts?: pulumi.CustomResourceOptions
  ) {
    super(new TemporalScheduleProvider(), name, args, opts, 'temporal', 'schedule');
  }
}

export async function createTemporalSchedule(
  name: string,
  args: TemporalScheduleResourceInputs,
  opts?: pulumi.CustomResourceOptions
) {
  const schedule = new TemporalSchedule(name, args, opts);
  return schedule;
}

// to get around the following issue:
// https://github.com/pulumi/pulumi/issues/2205
function replaceUndefinedWithNull(obj: any): void {
  if (obj === null || obj === undefined) {
    return;
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      replaceUndefinedWithNull(obj[i]);
    }
  } else if (typeof obj === 'object') {
    for (const key in obj) {
      replaceUndefinedWithNull(obj[key]);
    }
  }

  for (const key in obj) {
    if (obj[key] === undefined) {
      obj[key] = null;
    }
  }
}
