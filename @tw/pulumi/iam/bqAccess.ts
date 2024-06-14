import { addRolesToServiceAccount } from './roles';
import { GCPServiceAccount } from './sa';

export function bqAccess(serviceAccount: GCPServiceAccount, projects: string[]) {
  for (const project of projects) {
    addRolesToServiceAccount(serviceAccount, project, [
      'roles/bigquery.jobUser',
      'roles/bigquery.dataViewer',
    ]);
  }
}
