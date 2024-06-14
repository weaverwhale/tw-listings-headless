export function removeServiceIdFromPath(serviceId, path) {
  let result = path;
  const urlParts = path.split('/');
  if (urlParts[1] === serviceId) {
    urlParts[1] = '';
    urlParts.shift();
    result = urlParts.join('/');
  }
  return result;
}
