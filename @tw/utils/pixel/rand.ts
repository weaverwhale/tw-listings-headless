export function mulberry32(a: number) {
    return () => {
        let t = (a += 0x6d2b79f5);
        // tslint:disable-next-line: no-bitwise
        t = Math.imul(t ^ (t >>> 15), t | 1);
        // tslint:disable-next-line: no-bitwise
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        // tslint:disable-next-line: no-bitwise
        return (t ^ (t >>> 14)) >>> 0;
    };
}
export function mulberry01(a: number) {
    const m = mulberry32(a);
    return () => m() / (2 ** 32);
}
export function seedIfNeeded32(probablySeed: number | null = null) {
    return probablySeed !== null
        ? probablySeed
        : Math.floor(Math.random() * (2 ** 32));
}
