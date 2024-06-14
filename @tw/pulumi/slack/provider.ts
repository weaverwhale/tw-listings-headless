import * as slack from '@pulumi/slack';
import { getSecretValue } from '../secrets';

let slackProvider;

export function getSlackProvider() {
  if (!slackProvider) {
    slackProvider = new slack.Provider('slack', {
      token: getSecretValue('slack-pulumi-token'),
    });
  }
  return slackProvider;
}
