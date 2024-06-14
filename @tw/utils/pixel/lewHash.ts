import { num2base92 } from "./base62_92";

export function lewHash32(key: string, size: number) {
    const hash = Array(size).fill(1981),
        // tslint:disable-next-line: no-bitwise
        limitToBits = (x: number, bits: number) => x & (2 ** bits - 1),
        pass = (acc: number, val: number) => {
            // tslint:disable-next-line: no-bitwise
            acc += val; acc += acc << 10; acc ^= acc >> 6;
            return acc;
        };
    let i = key.length;
    while (i--) {
        const b = i % size;
        hash[b] = pass(hash[b], key.charCodeAt(i));
    }
    for (let u = size - 1; u >= 0; --u)
        for (i = 1; i < size; ++i) {
            hash[i] = pass(hash[i], hash[u]);
            hash[u] = pass(hash[u], hash[i]);
        }
    if (hash.length == 1) return [limitToBits(hash[0], 32)];
    return hash.map((x, i) => limitToBits(x, 32));
}
const pad = (s: string, size: number) => {
    while (s.length < size) s = '0' + s;
    return s;
};
export function lewHashStr(key: string, size: number) {
    return lewHash32(key, size).map((a) => pad(num2base92(a), 5)).join(``);
}
export function lewHashStr36(key: string, size: number) {
    return lewHash32(key, size).map((a) => pad(a.toString(36), 6)).join(``);
}

//export function lewHashB4(s: string) { return lewHashStr(s, 4); }
export function lewHashB6(s: string) { return lewHashStr(s, 6); }