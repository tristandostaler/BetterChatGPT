import React from 'react';

import { useGoogleLogin, googleLogout } from '@react-oauth/google';

import useStore from '@store/cloud-auth-store';
import useLocalStore from '@store/store';

import { createFile, searchFile, updateLocalStateFromDrive } from '@api/google-api'

const LoginButton = () => {
  const setGoogleAccessToken = useStore((state) => state.setGoogleAccessToken);
  const googleAccessToken = useStore((state) => state.googleAccessToken);
  var fileId = useStore((state) => state.fileId);
  const setFileId = useStore((state) => state.setFileId);
  const setCurrentChatIndex = useLocalStore(state => state.setCurrentChatIndex);
  const getCurrentChatIndex = () => { return useLocalStore.getState().currentChatIndex };
  const setState = useLocalStore.setState;
  const ghm = () => { return useLocalStore.getState().hideSideMenu }
  const shm = useLocalStore(state => state.setHideSideMenu )

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      console.log(codeResponse);
      setGoogleAccessToken(codeResponse.access_token);
      if (fileId == null) {
        searchFile(codeResponse.access_token).then(resp => {
          // console.log(resp);
          fileId = resp.files[0].id;
          if (fileId) {
            setFileId(fileId);
            updateLocalStateFromDrive(codeResponse.access_token, fileId, setCurrentChatIndex, getCurrentChatIndex, setState, () => { }, ghm, shm );
          } else {
            var fileContent = JSON.stringify(useLocalStore.getState());
            createFile(codeResponse.access_token, fileContent).then((resp) => {
              // console.log(resp);
              fileId = resp.id;
              if (fileId) {
                setFileId(fileId);
                updateLocalStateFromDrive(codeResponse.access_token, fileId, setCurrentChatIndex, getCurrentChatIndex, setState, () => { }, ghm, shm );
              }
            });
          }
        })
      } else {
        updateLocalStateFromDrive(codeResponse.access_token, fileId, setCurrentChatIndex, getCurrentChatIndex, setState, () => { },ghm, shm );
      }
    },
    onError: () => {
      console.log('Login Failed');
    },
    scope: 'https://www.googleapis.com/auth/drive.file',
  });

  const logout = () => {
    setGoogleAccessToken(undefined);
    googleLogout();
  };

  return (
    <div>
      {googleAccessToken ? (
        <button className='btn btn-neutral' onClick={logout}>
          Stop syncing data on Google Drive
        </button>
      ) : (
        <button className='btn btn-neutral' onClick={() => login()}>
          Start syncing data on Google Drive
        </button>
      )}
    </div>
  );
};

export default LoginButton;
