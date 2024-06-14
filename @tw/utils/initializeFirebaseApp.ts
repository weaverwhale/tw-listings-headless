import { projectId } from '@tw/constants';
import admin, { AppOptions } from 'firebase-admin';

export function initializeFirebaseApp(
  otherAdmin,
  additionalOptions: { options?: AppOptions; name?: string } = {}
): admin.app.App {
  const { options = {}, name } = additionalOptions;
  options.projectId = projectId;
  // initializeFirebaseApp is now used to get the default app
  // in some places

  if (!name && otherAdmin.apps.length > 0) {
    return otherAdmin.apps[0];
  }

  const app: admin.app.App = otherAdmin.initializeApp(options, name);

  if (process.env.IS_LOCAL) {
    // when using a link we have to init here too
    try {
      admin.initializeApp(options, name);
    } catch {
      // prob not a link
      console.log('admin not reinitialized');
    }
  }

  return app;
}
