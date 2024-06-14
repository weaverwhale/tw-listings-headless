import { array2list } from './array2list';

describe('array2list', () => {
  test('turns an array of strings into a human-readable list', () => {
    const arr = ['lions', 'tigers', 'bears'];
    expect(array2list(arr)).toEqual('lions, tigers, and bears'); // hit em with the oxford comma
  });
  test('makes sense with a one-member list', () => {
    const arr = ['lions'];
    expect(array2list(arr)).toEqual('lions');
  });
  test('doesnt mutate the original array', () => {
    const arr = ['lions', 'tigers', 'bears'];
    const arrCopy = [...arr];
    array2list(arr);
    expect(arr).toEqual(arrCopy);
  });
});
