import { invokeCSEFunction } from '@hooks/AppWriteAPI/client';
import { email, handleException, password } from './appwrite';

export const fetchNoCors = async (url: string, options: {}, headers: Headers = new Headers()) => {
    headers.set("X-Requested-With", "XMLHttpRequest")
    try {
        const res = await invokeCSEFunction(JSON.stringify({ type: "cors", url: url, options: options }));

        if (res.statusCode != 200) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        return JSON.parse(res.response).message;
    } catch (error: any) {
        return await handleException(error, () => { return fetchNoCors(url, headers) })
    }
}

