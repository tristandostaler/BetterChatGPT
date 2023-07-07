import { Client, Account, ID, Storage, Functions } from 'appwrite';

export const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') // Your API Endpoint
    .setProject('6455f3047ed54ae01e49');               // Your project ID

export const account = new Account(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export const functionId = '64a78f7a144da836d183';
export const storageBucketId = '6455f3fd34b2580eeed4';
export const fileIdAppWriteMarker = 'aw-';
export const getFileName = (apiKeyHashed: string) => { return fileIdAppWriteMarker + apiKeyHashed + '.js'; }
export const invokeCSEFunction = async (json_string_payload: string) => {
    return await functions.createExecution(functionId, json_string_payload)
}