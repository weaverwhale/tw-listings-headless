import * as slack from '@pulumi/slack';
import * as pulumi from '@pulumi/pulumi';
import { getSlackProvider } from './provider';

export function getSlackUserByEmail(email): pulumi.Output<slack.GetUserResult> {
  const user = slack
    .getUser(
      {
        email,
      },
      { provider: getSlackProvider() }
    )
    .catch(() => null as slack.GetUserResult);
  return pulumi.output(user);
}
