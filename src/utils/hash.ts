import { SHA1, MD5 } from 'crypto-js';

export const sha1Hash = (input: string) => {
    return SHA1(input).toString();
}

export const md5Hash = (input: string) => {
    var maxLength = 30; // The max filename length using AppWrite is 36. Because we add "aw-" and ".js", we can only use 30 chars
    return MD5(input + MD5(input).toString().substring(0, maxLength)).toString().substring(0, maxLength);
}

// export const sha1Hash = (input: string) => {
//     return sha1(input)
// };