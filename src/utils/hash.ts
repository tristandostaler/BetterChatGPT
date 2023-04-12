import { sha1, sha256, sha384, sha512 } from 'crypto-hash';
export const sha1Hash = (input: string) => {
    return sha1(input)
};