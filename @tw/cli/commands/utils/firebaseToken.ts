import axios from 'axios';
import { cliError } from '../../utils/logs';
import { get } from '../config';

export default async function printFirebaseToken(argv) {
  const email = argv.email || get('email');
  const password = argv.password || get('password');
  // https://console.cloud.google.com/apis/credentials/key/fbce60e4-598e-4955-8e21-ed7f3536e005?project=shofifi
  const key = 'AIzaSyAvTdGoGNw2-UhaTYwS67xQNAWGMwB1LqE';
  try {
    const data = (
      await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${key}`,
        { email, password, returnSecureToken: true }
      )
    ).data;
    console.log(data.idToken);
  } catch (e) {
    cliError(e);
  }
}
