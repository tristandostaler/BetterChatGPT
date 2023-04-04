import React from 'react';

import { useGoogleLogin, googleLogout } from '@react-oauth/google';

import useStore from '@store/cloud-auth-store';
import useLocalStore from '@store/store';

import { createFile, getFile, searchFile } from '@api/google-api'

function updateLocalStateFromDrive(access_token: string, fileId: string, setCurrentChatIndex: Function) {
  getFile(access_token, fileId).then((fileContent) => {
    var state = JSON.parse(fileContent);
    console.log(state);
    useLocalStore.setState(state);
    setCurrentChatIndex(0);
  });
}

const LoginButton = () => {
  const setGoogleAccessToken = useStore((state) => state.setGoogleAccessToken);
  const googleAccessToken = useStore((state) => state.googleAccessToken);
  var fileId = useStore((state) => state.fileId);
  const setFileId = useStore((state) => state.setFileId);
  const setCurrentChatIndex = useLocalStore((state) => state.setCurrentChatIndex);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      console.log(codeResponse);
      setGoogleAccessToken(codeResponse.access_token);
      if (fileId == null) {
        searchFile(codeResponse.access_token).then(resp => {
          console.log(resp);
          fileId = resp.files[0].id;
          if (fileId) {
            setFileId(fileId);
            updateLocalStateFromDrive(codeResponse.access_token, fileId, setCurrentChatIndex);
          } else {
            var fileContent = JSON.stringify(useLocalStore.getState());
            createFile(codeResponse.access_token, fileContent).then((resp) => {
              console.log(resp);
              fileId = resp.id;
              if (fileId) {
                setFileId(fileId);
                updateLocalStateFromDrive(codeResponse.access_token, fileId, setCurrentChatIndex);
              }
            });
          }
        })
      }
      if (fileId != null) {
        updateLocalStateFromDrive(codeResponse.access_token, fileId, setCurrentChatIndex);
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
