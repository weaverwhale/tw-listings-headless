import net from 'net';
import { cliError } from './logs';

const checked = {};

export async function testVpn(baseUrl: string): Promise<{ ok: boolean; old?: boolean }> {
  const promise = new Promise<{ ok: boolean; old?: boolean }>((resolve, reject) => {
    try {
      const addr = baseUrl.split('//')[1];
      if (checked[addr] !== undefined) {
        return resolve({ ok: checked[addr], old: true });
      }
      const socket = net.createConnection(80, addr, () => {
        clearTimeout(timeout);
        socket.destroy();
        checked[addr] = true;
        resolve({ ok: true });
      });
      socket.on('error', () => {
        socket.destroy();
        checked[addr] = false;
        resolve({ ok: false });
      });
      const timeout = setTimeout(() => {
        socket.destroy();
        resolve({ ok: false });
      }, 10000);
    } catch {
      reject({ ok: false });
    }
  });
  return promise;
}

export function vpnErrorLog() {
  cliError('You are trying to proxy to a internal service, but you are not connected to the VPN.');
  cliError(`Please connect to the VPN on project ${process.env.PROJECT_ID} and try again.`);
}
