import React from 'react';

import useStore from '@store/cloud-auth-store';
import useReLogin from './useReLogin';

const useGetFile = (isLoginProcess: boolean) => {
    const accessToken = useStore((state) => state.googleAccessToken);
    const fileId = useStore((state) => state.fileId);
    var reLogin = () => { };
    if (!isLoginProcess) {
        reLogin = useReLogin();
    }

    const getFile = () => {
        return fetch(
            `https://content.googleapis.com/drive/v3/files/${fileId}?alt=media`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        ).then((res) => {
            if (!res.ok) {
                reLogin();
                return null;
            }
            return res.text();
        });
    }
    return getFile;
};

export default useGetFile;