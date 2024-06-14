export function str2hex(str: string, joiner = `:`) {
    return str.split(``).map(a => a.charCodeAt(0).toString(16)).join(joiner);
}
export function hex2str(hex: string, joiner = `:`) {
    return hex.split(joiner).map(a => String.fromCharCode(parseInt(a, 16))).join(``);
}