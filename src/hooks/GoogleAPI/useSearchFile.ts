import React from 'react';

import useStore from '@store/cloud-auth-store';
import useReLogin from './useReLogin';

const useSearchFile = (isLoginProcess: boolean) => {
    const accessToken = useStore((state) => state.googleAccessToken);
    const fileName = 'better-chatgpt.json';
    var reLogin = () => { };
    if (!isLoginProcess) {
        reLogin = useReLogin();
    }

    const searchFile = () => {
        return fetch(
            `https://content.googleapis.com/drive/v3/files?q=name+%3d+%27${fileName}%27`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        ).then(res => {
            if (!res.ok) {
                reLogin();
                return null;
            }
            return res.json();
        });
    }
    return searchFile;
};

export default useSearchFile;