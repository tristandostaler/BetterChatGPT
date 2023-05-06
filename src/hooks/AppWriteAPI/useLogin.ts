import React from 'react';

import useStore from '@store/cloud-auth-store';
import useLocalStore from '@store/store';

import useCreateFile from '@hooks/AppWriteAPI/useCreateFile';
import useUpdateLocalStateFromDrive from '@hooks/AppWriteAPI/useUpdateLocalStateFromDrive';
import { account, getFileName, storage, storageBucketId } from '@hooks/AppWriteAPI/client';

import { ID } from 'appwrite';
import { md5Hash } from '@utils/hash';

const useLogin = () => {
    const setToastStatus = useLocalStore((state) => state.setToastStatus);
    const setToastMessage = useLocalStore((state) => state.setToastMessage);
    const setToastShow = useLocalStore((state) => state.setToastShow);
    const getApiKey = () => { return useLocalStore.getState().apiKey ?? "" };
    const showLoggedIn = () => {
        setToastStatus('success');
        setToastMessage('Logged in!');
        setToastShow(true);
    }
    const showErrorLoggingIn = (errorMessage: string) => {
        setToastStatus('error');
        setToastMessage(errorMessage);
        setToastShow(true);
    }

    const fileId = () => { return useStore.getState().fileId };
    const createFile = useCreateFile(true);
    const updateLocalStateFromDrive = useUpdateLocalStateFromDrive(true, () => { }, () => { return false; });
    const setFileId = useStore((state) => state.setFileId);
    const setIsAppWriteLoggedIn = useStore((state) => state.setIsAppWriteLoggedIn);

    const login = () => {
        setIsAppWriteLoggedIn(false);
        const apiKey = getApiKey();
        if (apiKey == "") {
            showErrorLoggingIn('The API Key is not set. The API key is necessary to login using AppWrite!');
            return
        }
        const apiKeyHashed = md5Hash(apiKey);
        var email = apiKeyHashed + '@tristandostaler.com';
        var password = apiKeyHashed;
        var fileName = getFileName(apiKeyHashed);
        if (fileId() == null) {
            // Register User
            account.create(
                ID.unique(),
                email,
                password
            ).then(r => {
                createFile(fileName, JSON.stringify(useLocalStore.getState())).then(r => {
                    setFileId(fileName);
                    setIsAppWriteLoggedIn(true);
                    showLoggedIn();
                }).catch(error => {
                    showErrorLoggingIn('An error occured trying to create the state file - ' + error);
                })
            }).catch(r => {
                account.createEmailSession(email, password).then(r => {
                    setFileId(fileName);
                    setIsAppWriteLoggedIn(true);
                    storage.getFile(storageBucketId, fileName).then(r => {
                        updateLocalStateFromDrive(fileName)?.then(r => {
                            showLoggedIn();
                        });
                    }).catch(r => {
                        createFile(fileName, JSON.stringify(useLocalStore.getState())).then(r => {
                            setFileId(fileName);
                            setIsAppWriteLoggedIn(true);
                            showLoggedIn();
                        }).catch(error => {
                            showErrorLoggingIn('An error occured trying to create the state file - ' + error);
                        })
                    });
                }).catch(error => {
                    showErrorLoggingIn('An error occured trying to login - ' + error);
                })
            })
        } else {
            updateLocalStateFromDrive()?.then(r => {
                setIsAppWriteLoggedIn(true);
                setToastStatus('success');
                setToastMessage('Logged in!');
                setToastShow(true);
            }).catch(error => {
                showErrorLoggingIn('An error occured trying to update the local state - ' + error);
            })
        }
    }
    return login;
};

export default useLogin;
