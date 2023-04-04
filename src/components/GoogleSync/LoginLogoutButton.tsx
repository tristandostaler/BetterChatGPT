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
        <div className='p-6 border-b border-gray-200 dark:border-gray-600 flex flex-col items-center gap-4'>
          <div>
            <button className='btn btn-primary' id="login" onClick={() => login()}>
              Reconnect to Google Drive
            </button>
          </div>
          <div>
            <button className='btn btn-neutral' id="logout" onClick={logout}>
              Stop syncing data on Google Drive
            </button>
          </div>
        </div>
      ) : (
        <button className='btn btn-neutral' id="login" onClick={() => login()}>
          Start syncing data on Google Drive
        </button>
      )}
    </div>
  );
};

export default LoginButton;
