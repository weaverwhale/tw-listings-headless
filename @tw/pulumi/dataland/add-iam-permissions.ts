import * as pulumi from '@pulumi/pulumi';

export function getDataformDefaultServiceAccountEmail(projectNumber: pulumi.Input<String>) {
    return pulumi.interpolate`service-${projectNumber}@gcp-sa-dataform.iam.gserviceaccount.com`;
}