import path from 'node:path';

export default function setServiceAccount() {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(
    `service-account-${process.env.PROJECT_ID}.json`
  );
}
