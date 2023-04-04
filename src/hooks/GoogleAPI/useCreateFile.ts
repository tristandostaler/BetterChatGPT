import React from 'react';

import useStore from '@store/cloud-auth-store';
import useReLogin from './useReLogin';

const useCreateFile = (isLoginProcess: boolean) => {
    const accessToken = useStore((state) => state.googleAccessToken);
    const fileName = 'better-chatgpt.json';
    var reLogin = () => { };
    if (!isLoginProcess) {
        reLogin = useReLogin();
    }

    const createFile = (fileContent: string) => {
        var file = new Blob([fileContent], { type: 'text/plain' });
        var metadata = {
            'name': fileName, // Filename at Google Drive
            'title': fileName,
            'mimeType': 'text/plain', // mimeType at Google Drive
            'parents': ['root'], // Folder ID at Google Drive
        };
        var formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append('file', file);

        return fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
            method: 'POST',
            headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
            body: formData,
        }).then(res => {
            if (!res.ok) {
                reLogin();
                return null;
            }
            return res.json();
        });
    }
    return createFile;
};

export default useCreateFile;