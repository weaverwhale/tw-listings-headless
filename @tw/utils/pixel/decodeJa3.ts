
function lcg(x: number) {
    const a = 8121;
    const c = 28411;
    const m = 134456;
    const z = fix32int(Math.imul(a, x));

    return (z + c) % m;
}

function fix32int(number: number) {
    return number < 0 ? 0xffffffff + number + 1 : number;
}

const SAFE_ROLL = 10;

export function decodeJa3(s: string | null) {
    const ret = { pwd: ``, cont: ``, decoded: `` };
    const err = { ...ret, decoded: `error` };
    if (s === null) {
        console.log(`decodeJa3("${s}") nothing to decode`);
        return err;
    }
    try {
        const pwdStr = s.slice(0, 9);
        // tslint:disable-next-line: radix
        const pwd = parseInt(pwdStr);
        const cont = s.slice(9);
        let roll = pwd,
            r = '';
        for (let i = 0; i < cont.length; ++i) {
            roll = lcg(roll);
            const c = roll % SAFE_ROLL;
            //console.log({ i, roll, c });
            r += String.fromCharCode(cont.charCodeAt(i) - c);
        }
        return { pwd, cont, decoded: r };
    } catch (e: any) {
        console.error(`decodeJa3("${s}") error:`, e.message);
        return err;
    }
}

