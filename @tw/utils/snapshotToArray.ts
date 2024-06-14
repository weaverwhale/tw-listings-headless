
export function snapshotToArray(snapshot) {
  var docs = [];
  
  snapshot.forEach(doc => {
    docs.push({
      ...doc.data(),
      id: isNaN(doc.id) ? doc.id : +doc.id,
    });
  })
  return docs;
}