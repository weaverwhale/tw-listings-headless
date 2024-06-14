export const letters92 = `!"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_abcdefghijklmnopqrstuvwxyz{|}~`;


/*export function lettersRange(from: number, len: number) {
    return [...Array(len)].map((k, i) => String.fromCharCode(i + from)).join('');
}
const letters =
    lettersRange(48, 10) + lettersRange(65, 26) + lettersRange(97, 26),
    radix = letters.length;*/
const letters = letters92.replace(/[^A-Za-z0-9]/gm,"").slice(0, 62), radix = letters.length;
export function num2base62(n: number) {
    let r = '';
    while (n) {
        const v = n % radix;
        // console.log({ n, v, r });
        r = letters[v] + r;
        n = (n - v) / radix;
    }
    return r;
}

const radix92 = letters92.length;
export function num2base92(n: number) {
    if (n === 0) return letters92[0];
    let r = '';
    while (n) {
        const v = n % radix92;
        // console.log({ n, v, r });
        r = letters92[v] + r;
        n = (n - v) / radix92;
    }
    return r;
}
