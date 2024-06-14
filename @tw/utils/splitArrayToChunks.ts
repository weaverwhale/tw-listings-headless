export const splitArrayToChunks = <T = any>(array: T[] = [], chunk_size: number) => {
  return Array(Math.ceil(array.length / chunk_size))
    .fill(null)
    .map((_, index) => index * chunk_size)
    .map(begin => array.slice(begin, begin + chunk_size));
}
