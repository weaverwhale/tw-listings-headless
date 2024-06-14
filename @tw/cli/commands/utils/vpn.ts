import { chalkError, chalkSuccess } from '../../utils/logs';
import { testVpn } from '../../utils/vpn';

const envs = {
  shofifi: 'kourier.internal.whale3.io',
  'triple-whale-staging': 'stg.kourier.internal.whale3.io',
};

export async function vpnTest() {
  for (const [key, value] of Object.entries(envs)) {
    const url = `http://${value}`;
    testVpn(url).then(({ ok }) => {
      if (ok) {
        console.log(`${key}: ${chalkSuccess('ok')}`);
      } else {
        console.log(`${key}: ${chalkError('not ok')}`);
      }
    });
  }
}
