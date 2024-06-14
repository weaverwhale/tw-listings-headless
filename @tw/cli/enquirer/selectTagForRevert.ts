import { exit } from 'node:process';
import { getAllServices } from '../utils/getAllServices';
import { getServiceTags } from '../utils/getServiceTags';
import { cliError, cliLog } from '../utils/logs';
import { cliExit } from '../utils/exit';

const { Confirm, Select } = require('enquirer');

export async function selectTagForRevert(serviceId: string) {
  try {
    const choices = (await getServiceTags(serviceId)).slice(0, 5).map((rev, i) => {
      return {
        message: `${rev.shortSha} - ${rev.created}`,
        hint: i === 0 ? 'Latest revision' : undefined,
        name: rev.commitSha,
      };
    });
    if (!choices.length) {
      cliError(`No revisions found for service ${serviceId}.`);
      cliError('You can try again or find the commit SHA you want to revert to and run:');
      cliLog(`tw revert ${serviceId} --tag <commit-sha>`);
      cliExit();
    }
    let confirmed = false;
    let revision: string;
    do {
      const chooseRevision = new Select({
        message: 'Which revision?',
        choices,
      });
      revision = await chooseRevision.run();
      if (revision === choices[0].name) {
        const confirm = new Confirm({
          type: 'confirm',
          message: `It doesn't make sense to revert to the current revision. Are you sure you want to continue?`,
        });
        confirmed = await confirm.run();
      } else {
        confirmed = true;
      }
    } while (!confirmed);
    return revision;
  } catch (e) {
    exit(0);
  }
}
