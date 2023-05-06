import { SHA1, MD5 } from 'crypto-js';

export const sha1Hash = (input: string) => {
    return SHA1(input).toString();
}

export const md5Hash = (input: string) => {
    return MD5(input).toString().substring(0, 28);
}

// export const sha1Hash = (input: string) => {
//     return sha1(input)
// };