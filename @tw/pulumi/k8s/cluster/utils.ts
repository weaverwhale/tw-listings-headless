export function getClusterRoot() {
  const dirname = __dirname.replace('/pulumi/module/', '/pulumi/src/');
  return dirname;
}
