import { merge } from './object';

describe('merge', () => {
  it('should merge two objects', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { c: 3 };
    const result = merge(obj1, obj2);
    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });
  it('should merge deeply', () => {
    const obj1 = { a: { b: 1 } };
    const obj2 = { a: { c: 2 } };
    const result = merge(obj1, obj2);
    expect(result).toEqual({ a: { b: 1, c: 2 } });
  });
  it('should overwrite with the second object', () => {
    const obj1 = { a: 1 };
    const obj2 = { a: 2 };
    const result = merge(obj1, obj2);
    expect(result).toEqual({ a: 2 });
  });
  it('should overwrite with the second object deeply', () => {
    const obj1 = { a: { b: 1 } };
    const obj2 = { a: { b: 2 } };
    const result = merge(obj1, obj2);
    expect(result).toEqual({ a: { b: 2 } });
  });
  it('should merge three objects', () => {
    const obj1 = { a: 1 };
    const obj2 = { b: 2 };
    const obj3 = { c: 3 };
    const result = merge(obj1, obj2, obj3);
    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });
  it('should merge three objects deeply', () => {
    const obj1 = { a: { b: 1 } };
    const obj2 = { a: { c: 2 } };
    const obj3 = { a: { d: 3 } };
    const result = merge(obj1, obj2, obj3);
    expect(result).toEqual({ a: { b: 1, c: 2, d: 3 } });
  });
  it('should overwrite with the third object', () => {
    const obj1 = { a: 1 };
    const obj2 = { b: 2 };
    const obj3 = { a: 3 };
    const result = merge(obj1, obj2, obj3);
    expect(result).toEqual({ a: 3, b: 2 });
  });
  it('should overwrite with the third object deeply', () => {
    const obj1 = { a: { b: 1 } };
    const obj2 = { a: { c: 2 } };
    const obj3 = { a: { b: 3 } };
    const result = merge(obj1, obj2, obj3);
    expect(result).toEqual({ a: { b: 3, c: 2 } });
  });
  it('should not mutate original objects', () => {
    const obj1 = { a: { b: 1 } };
    const obj2 = { a: { c: 2 } };
    const result = merge(obj1, obj2);
    expect(obj1).toEqual({ a: { b: 1 } });
    expect(obj1).toBe(obj1);
    expect(obj2).toEqual({ a: { c: 2 } });
    expect(obj2).toBe(obj2);
    expect(result).toEqual({ a: { b: 1, c: 2 } });
    expect(result).not.toBe(obj1);
    expect(result).not.toBe(obj2);
  });
});
