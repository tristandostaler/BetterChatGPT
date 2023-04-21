import React from 'react';

import { useGoogleLogin } from '@react-oauth/google';

import useStore from '@store/cloud-auth-store';
import useLocalStore from '@store/store';

import useCreateFile from '@hooks/GoogleAPI/useCreateFile';
import useSearchFile from '@hooks/GoogleAPI/useSearchFile';
import useUpdateLocalStateFromDrive from '@hooks/GoogleAPI/useUpdateLocalStateFromDrive';

const useLogin = () => {
    const fileId = () => { return useStore.getState().fileId };
    const createFile = useCreateFile(true);
    const searchFile = useSearchFile(true);
    const updateLocalStateFromDrive = useUpdateLocalStateFromDrive(true, () => { }, () => { return false; });
    const setGoogleAccessToken = useStore((state) => state.setGoogleAccessToken);
    const setGoogleRefreshTokenExpirationTime = useStore((state) => state.setGoogleRefreshTokenExpirationTime);
    const setFileId = useStore((state) => state.setFileId);

    const googleLogin = useGoogleLogin({
        onSuccess: (codeResponse) => {
            console.log(codeResponse);
            setGoogleRefreshTokenExpirationTime(Date.now() + ((codeResponse.expires_in - 60) * 1000))
            setGoogleAccessToken(codeResponse.access_token);
            if (fileId() == null) {
                searchFile().then(resp => {
                    if (!resp) {
                        return;
                    }
                    // console.log(resp);
                    var fileIdTemp = null;
                    if (resp.files.length > 0) {
                        fileIdTemp = resp.files[0].id;
                    }
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
