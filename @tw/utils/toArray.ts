import firebase from 'firebase-admin';

export function toArray(
  snapshot: firebase.firestore.QuerySnapshot<FirebaseFirestore.DocumentData> | []
) {
  const docs: any[] = [];

  snapshot.forEach((doc) => {
    docs.push({
      ...doc.data(),
      id: isNaN(+doc.id) ? doc.id : +doc.id,
    });
  });
  return docs;
}
