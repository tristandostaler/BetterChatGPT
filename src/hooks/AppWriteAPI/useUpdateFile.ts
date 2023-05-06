import React from 'react';

import useStore from '@store/cloud-auth-store';
import useReLogin from './useReLogin';
import useCreateFile from './useCreateFile';

const useUpdateFile = () => {
    const fileId = () => { return useStore.getState().fileId ?? "" };
    var fileName = fileId();
    const reLogin = useReLogin();
    const createFile = useCreateFile(false);

    const updateFile = (fileContent: string): Promise<any> => {
        return createFile(fileName, fileContent)
        // .catch((reason) => {
        //     reLogin();
        // });
    }
    return updateFile;
};

export default useUpdateFile;