import firebase from 'firebase-admin';
import moment from 'moment-timezone';

export const getEarliestDate = (date: firebase.firestore.Timestamp) => {
  const m = moment.unix(date?.seconds || (date as any)?._seconds || undefined);
  if (m.isValid()) {
    return m;
  }
  return null;
};
