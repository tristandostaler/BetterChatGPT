import React from 'react';

import useStore from '@store/cloud-auth-store';
import useReLogin from './useReLogin';

const useGetFile = (isLoginProcess: boolean) => {
    const accessToken = () => { return useStore.getState().googleAccessToken };
    const fileId = () => { return useStore.getState().fileId };
    var reLogin = () => { };
    if (!isLoginProcess) {
        reLogin = useReLogin();
    }

    const getFile = () => {
        return fetch(
            `https://content.googleapis.com/drive/v3/files/${fileId()}?alt=media`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken()}`,
                },
            }
        ).then((res) => {
            if (!res.ok) {
                reLogin();
                return null;
            }
            return res.text();
        }).catch((reason) => { console.log(reason); reLogin(); });
    }
    return getFile;
};

export default useGetFile;