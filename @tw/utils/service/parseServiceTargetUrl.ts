export function parseServiceTargetUrl(path: string) {
  const pathParts = path.split('/').filter(Boolean);
  let servicePart = pathParts.shift();
  let deployment;
  let stack;
  if (servicePart?.includes('.')) {
    [deployment, servicePart] = servicePart.split('.');
  }
  if (servicePart?.includes('_')) {
    [servicePart, stack] = servicePart.split('_');
  }
  const serviceId = servicePart;
  path = pathParts.join('/');
  if (path.startsWith('/')) path = path.slice(1);
  return { serviceId, path, deployment, stack };
}
