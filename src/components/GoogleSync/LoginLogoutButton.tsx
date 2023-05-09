import React, { useEffect, useState } from 'react';

import useStore from '@store/cloud-auth-store';
import useLoginGoogle from '@hooks/GoogleAPI/useLogin';
import useLogoutGoogle from '@hooks/GoogleAPI/useLogout';
import useLoginAppWrite from '@hooks/AppWriteAPI/useLogin';
import useLogoutAppWrite from '@hooks/AppWriteAPI/useLogout';
import { fileIdAppWriteMarker } from '@hooks/AppWriteAPI/client';

const LoginButton = () => {
  var getFileId = () => { return useStore.getState().fileId ?? "" };
  const syncType = () => { return getFileId().startsWith(fileIdAppWriteMarker) ? 'appwrite' : getFileId() == '' ? '' : 'google' };
  var loginAppWrite = useLoginAppWrite();
  var loginGoogle = useLoginGoogle();
  var logoutAppWrite = useLogoutAppWrite();
  var logoutoogle = useLogoutGoogle();
  const isAppWriteLoggedIn = useStore((state) => state.isAppWriteLoggedIn);
  const googleAccessToken = useStore((state) => state.googleAccessToken);

  const login = () => {
    if (syncType() == 'appwrite') {
      loginAppWrite();
    } else if (syncType() == 'google') {
      loginGoogle();
    }
  }

  const logoutAction = () => {
    if (syncType() == 'appwrite') {
      logoutAppWrite();
    } else if (syncType() == 'google') {
      logoutoogle();
    }
  }

  if (syncType() == 'appwrite') {
    var [isConnected, setIsConnected] = useState<boolean>(isAppWriteLoggedIn ?? false);
  } else if (syncType() == 'google') {
    var [isConnected, setIsConnected] = useState<boolean>(googleAccessToken != undefined);
  } else {
    var [isConnected, setIsConnected] = useState<boolean>(false);
  }

  const setFileId = useStore((state) => state.setFileId);

  const [wasConnected, setWasConnected] = useState<boolean>(getFileId() != "");
  const logout = () => { logoutAction(); setFileId(undefined); setIsConnected(false); setWasConnected(false); };

  useEffect(() => {
    setIsConnected(googleAccessToken != undefined ? true : isAppWriteLoggedIn ?? false);
  }, [isAppWriteLoggedIn, googleAccessToken])

  return (
    <div>
      {isConnected ? (
        <button className='btn btn-neutral' id="logout" onClick={logout}>
          Stop syncing data
        </button>
      ) : wasConnected ? (
        <div className='p-6 flex flex-col items-center gap-4'>
          <div>
            <button className='btn btn-primary' id="login" onClick={() => login()}>
              Reconnect to sync data
            </button>
          </div>
          <div>
            <button className='btn btn-neutral' id="logout" onClick={logout}>
              Stop syncing data
            </button>
          </div>
        </div>
      ) : (
        <div className='p-6 flex flex-col items-center gap-2'>
          <div>
            <button className='btn btn-primary' id="loginAppWrite" onClick={() => { loginAppWrite() }}>
              Start syncing data on AppWrite (prefered)
            </button>
          </div>
          <div>
            <button className='btn btn-neutral' id="loginGoogle" onClick={() => { loginGoogle() }}>
              Start syncing data on Google Drive
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginButton;
