import React from 'react';

import useReLogin from './useReLogin';
import { storage, storageBucketId } from './client';

const useCreateFile = (isLoginProcess: boolean) => {
    var reLogin = () => { };
    if (!isLoginProcess) {
        reLogin = useReLogin();
    }

    const createFile = (fileName: string, fileContent: string) => {
        var file = new File([fileContent], fileName)
        return storage.createFile(storageBucketId, fileName, file).catch((reason) => { console.log(reason); reLogin(); });
    }
    return createFile;
};

export default useCreateFile;