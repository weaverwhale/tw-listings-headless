// import { trace } from "../misc";
import { letters92, num2base62 } from "./base62_92";
import { lewHash32 } from "./lewHash";
import { mulberry32, seedIfNeeded32 } from "./rand";


// const list64 = [...[...Array(26).keys()].map(a => (String.fromCharCode(a + 'a'.charCodeAt(0))).toUpperCase()), ...[...Array(36).keys()].map(a => a.toString(36))];
const list64 = letters92.replace(/[^A-Za-z0-9]/gm,"").slice(0, 64);

export function timeFromId(id: string) {
    if (!isValidId(id)) return -1;
    return parseInt(id.slice(0, 9), 36);
}

export function genId(tail = 3, timestamp = 0, seed: number | null = null, randStr: string | null = null) {
    const rand = mulberry32(seedIfNeeded32(seed));
    return () => {
        // function log(a: string) { if (!dumped) trace(() => a); }
        let tailStr = ``;
        while (tailStr.length < tail) tailStr += (randStr || num2base62(rand()));
        // log(`tail target length is ${tail}, str is ${tailStr} of length ${tailStr.length}`);
        let d = (timestamp || Date.now()).toString(36);
        if (d.length < 9) d = `0` + d;
        const preId = `${d}${tailStr.slice(0, tail)}`;
        // log(`result: ${preId}${checksum(preId)} (made of ${preId} and ${checksum(preId)})`);
        // dumped = true;
        return `${preId}${checksum(preId)}`;
    }
}
const checksumSize = 2;
export function isValidId(candidate: string) {
    // console.log(`checksum for ${candidate.slice(-checksumSize)} is ${checksum(candidate.slice(-checksumSize))}\nfull: ${candidate}`);

    return candidate.slice(-checksumSize) == checksum(candidate.slice(0, -checksumSize));
}

export function sliceWithHash(str: string, length: number, hashSize = 1) {
    if (str.length <= length) return str;
    return str.slice(0, length) + checksum(str.slice(length), hashSize);
}

function checksum(preId: string, size = checksumSize) {
    return nums2str64(lewHash32(preId, size));
}

function nums2str64(nums: number[]) {
    return nums.map(n => list64[n % list64.length]).join(``);
}