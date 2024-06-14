import { validUrl } from './validUrl';

export const extractProductHandleFromUrl = (url: string) => {
  if (!validUrl(url)) {
    return '';
  }
  const urlObj = new URL(url);
  const { pathname } = urlObj;
  const pathParts = pathname.split('/');

  if (pathParts.includes('products')) {
    return pathParts.pop();
  }

  // if (pathParts.includes('collections')) {
  //   return pathParts.pop();
  // }

  return '';
};
