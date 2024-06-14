import Admin from 'firebase-admin';
import { initializeFirebaseApp } from './initializeFirebaseApp';

export async function authorizeUser(perm: string, headers: any, func: any, params: any[] = []) {
  const admin = await initializeFirebaseApp(Admin);
  let user = await admin.auth().verifyIdToken(headers.authorization.split('Bearer ')[1]);

  const usersInShop = await admin.firestore().collection('users').doc(user.uid).get();

  const roles = usersInShop.data()?.shops[headers.shop_domain].accessRoles || [];

  console.log('roles', roles);
  if (roles.includes(perm)) {
    return func(...params);
  } else {
    return false;
  }
}
