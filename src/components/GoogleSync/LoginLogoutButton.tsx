import React from 'react';

import useStore from '@store/cloud-auth-store';
import useLogin from '@hooks/GoogleAPI/useLogin';
import useLogout from '@hooks/GoogleAPI/useLogout';

const LoginButton = () => {
  const googleAccessToken = useStore((state) => state.googleAccessToken);
  const login = useLogin();
  const logout = useLogout();
  const wasGoogleConnected = useStore(state => state.fileId) ? true : false;

  return (
    <div>
      {googleAccessToken ? (
        <button className='btn btn-neutral' id="logout" onClick={logout}>
          Stop syncing data on Google Drive
        </button>
      ) : wasGoogleConnected ? (
        <button className='btn btn-primary' id="login" onClick={() => login()}>
          Reconnect to Google Drive
        </button>
      ) : (
        <button className='btn btn-neutral' id="login" onClick={() => login()}>
          Start syncing data on Google Drive
        </button>
      )}
    </div>
  );
};

export default LoginButton;
