import React from 'react';

import useStore from '@store/cloud-auth-store';
import useReLogin from './useReLogin';
import { storage, storageBucketId } from './client';

const useGetFile = (isLoginProcess: boolean) => {
    const fileId = () => { return useStore.getState().fileId ?? "" };
    var reLogin = (reason: any) => { };
    if (!isLoginProcess) {
        reLogin = useReLogin();
    }

    const getFile = (fileName: string = "") => {
        if (fileName == "") {
            fileName = fileId();
        }
        var contentUrl = storage.getFileView(storageBucketId, fileName)
        return fetch(contentUrl, {
            credentials: "include",
            cache: "no-cache",
        }).then((res) => {
            if (!res.ok) {
                return reLogin("Response not ok");
            }
            return res.json();
        }).catch((reason) => { reLogin(reason); });
    }
    return getFile;
};

export default useGetFile;
