import { firestore } from 'firebase-admin';
import { toArray } from './toArray';

/**
 *
 * @param shop shop id
 * @param includeAdmin should we include fake 'admin' id user (admin is not a real user but admin users has access to all shops so maybe we want to include it in the list)
 * @returns array of user ids
 */
export const getAllUserIdsForShop = async (
  shop: string,
  includeAdmin = false
): Promise<string[]> => {
  const users = await firestore().collection('shops').doc(shop).collection('users').get();
  let allUsers = toArray(users).map((user) => user.id);

  if (includeAdmin) {
    allUsers.concat('admin');
  }

  return allUsers;
};
