import firebase from 'firebase-admin';

export function toHash(
  snapshot: firebase.firestore.QuerySnapshot<FirebaseFirestore.DocumentData> | []
) {
  var docs = {};
  snapshot.forEach((doc) => {
    docs[doc.id] = {
      ...(typeof doc.data == 'function' ? doc.data() : doc),
      id: isNaN(+doc.id) ? doc.id : +doc.id,
    };
  });
  return docs;
}
