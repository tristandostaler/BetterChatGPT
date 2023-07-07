import { account } from '@hooks/AppWriteAPI/client';
import useLocalStore from '@store/store';
import { md5Hash } from '@utils/hash';
import { AppwriteException, ID } from 'appwrite';
const getApiKey = () => { return useLocalStore.getState().apiKey ?? "" };

const apiKey = getApiKey();
const apiKeyHashed = md5Hash(apiKey);
export const email = apiKeyHashed + '@tristandostaler.com';
export const password = apiKeyHashed;

export const handleException = async (error: Error, retry_func: Function) => {
    var msg = `An error occured calling AppWrite.\nIf not already done, you need to ask Tristan Dostaler for access (give him this email: ${email}).\nError: `;
    if (error instanceof AppwriteException) {
        if (error.message.includes('"["any","guests"]"')) {
            try {
                await account.create(
                    ID.unique(),
                    email,
                    password
                ).catch(error => error)
                await account.createEmailSession(email, password);
                return await retry_func()
            } catch (errorSub) {
                throw new AppwriteException(msg + errorSub);
            }
        }
    }

    throw new AppwriteException(msg + error);
}