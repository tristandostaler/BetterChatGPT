import React from 'react';

import useReLogin from './useReLogin';
import { storage, storageBucketId } from './client';

const useDeleteFile = (isLoginProcess: boolean) => {
    var reLogin = (reason: any) => { };
    if (!isLoginProcess) {
        reLogin = useReLogin();
    }

    const deleteFile = (fileName: string) => {
        return storage.deleteFile(storageBucketId, fileName).catch(reLogin);;
    }
    return deleteFile;
};

export default useDeleteFile;