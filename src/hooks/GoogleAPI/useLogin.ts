import React from 'react';

import { useGoogleLogin } from '@react-oauth/google';

import useStore from '@store/cloud-auth-store';
import useLocalStore from '@store/store';

import useCreateFile from '@hooks/GoogleAPI/useCreateFile';
import useSearchFile from '@hooks/GoogleAPI/useSearchFile';
import useUpdateLocalStateFromDrive from '@hooks/GoogleAPI/useUpdateLocalStateFromDrive';

const useLogin = () => {
    const fileId = useStore((state) => state.fileId);
    const createFile = useCreateFile(true);
    const searchFile = useSearchFile(true);
    const updateLocalStateFromDrive = useUpdateLocalStateFromDrive(true, () => { });
    const setGoogleAccessToken = useStore((state) => state.setGoogleAccessToken);
    const setFileId = useStore((state) => state.setFileId);

    const googleLogin = useGoogleLogin({
        onSuccess: (codeResponse) => {
            console.log(codeResponse);
            setGoogleAccessToken(codeResponse.access_token);
            if (fileId == null) {
                searchFile().then(resp => {
                    if (!resp) {
                        return;
                    }
                    // console.log(resp);
                    var fileIdTemp = resp.files[0].id;
                    if (fileIdTemp) {
                        setFileId(fileIdTemp);
                        updateLocalStateFromDrive();
                    } else {
                        var fileContent = JSON.stringify(useLocalStore.getState());
                        createFile(fileContent).then((resp) => {
                            if (!resp) {
                                return;
                            }
                            // console.log(resp);
                            var fileIdTemp = resp.id;
                            if (fileIdTemp) {
                                setFileId(fileIdTemp);
                                updateLocalStateFromDrive();
                            }
                        });
                    }
                })
            } else {
                updateLocalStateFromDrive();
            }
        },
        onError: () => {
            console.log('Login Failed');
        },
        scope: 'https://www.googleapis.com/auth/drive.file',
    });

    const login = () => {
        googleLogin();
    }
    return login;
};

export default useLogin;