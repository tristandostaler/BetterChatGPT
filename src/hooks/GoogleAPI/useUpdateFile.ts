import React from 'react';

import useStore from '@store/cloud-auth-store';
import useReLogin from './useReLogin';

const useUpdateFile = () => {
    const accessToken = () => { return useStore.getState().googleAccessToken };
    const fileId = () => { return useStore.getState().fileId };
    const fileName = 'better-chatgpt.json';
    const reLogin = useReLogin();

    const updateFile = (fileContent: string) => {
        const formData = new FormData();
        var file = new Blob([fileContent], { type: 'text/plain' });
        var metadata = {
            'name': fileName, // Filename at Google Drive
            'title': fileName,
            'mimeType': 'text/plain', // mimeType at Google Drive
        };
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append('file', file);

        return fetch(
            `https://www.googleapis.com/upload/drive/v3/files/${fileId()}?uploadType=multipart`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${accessToken()}`,
                },
                body: formData,
            }
        ).then((res) => {
            if (!res.ok) {
                reLogin();
                return null;
            }
            return res.json();
        }).catch((reason) => {
            console.log(reason);
            reLogin();
        });
    }
    return updateFile;
};

export default useUpdateFile;