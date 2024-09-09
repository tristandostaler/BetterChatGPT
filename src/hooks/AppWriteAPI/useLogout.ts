import React from 'react';

import { googleLogout } from '@react-oauth/google';
import { account } from '@hooks/AppWriteAPI/client';
import useStore from '@store/cloud-auth-store';

const useLogout = () => {
    const setIsAppWriteLoggedIn = useStore((state) => state.setIsAppWriteLoggedIn);
    const setFileId = useStore((state) => state.setFileId);
    
    const logout = () => {
        setIsAppWriteLoggedIn(false);
        setFileId(undefined);
        account.getSession("current").then((session) => { account.deleteSession(session["$id"]); } );
    }
    return logout;
};

export default useLogout;
