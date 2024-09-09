import React from 'react';

import useStore from '@store/cloud-auth-store';
import useReLogin from './useReLogin';
import useCreateFile from './useCreateFile';
import useDeleteFile from './useDeleteFile';
import { sleep } from '@utils/utils';

const useUpdateFile = () => {
    const fileId = () => { return useStore.getState().fileId ?? "" };
    const reLogin = useReLogin();
    const createFile = useCreateFile(false);
    const deleteFile = useDeleteFile(false);

    const updateFile = (fileContent: string): Promise<any> => {
        var fileName = fileId();
        return deleteFile(fileName).then(() => { return sleep(100).then(() => { return createFile(fileName, fileContent); }) }).catch((reason) => { reLogin(); });
    }
    return updateFile;
};

export default useUpdateFile;
