import React from 'react';

import { googleLogout } from '@react-oauth/google';

import useStore from '@store/cloud-auth-store';

const useLogout = () => {
    const setIsAppWriteLoggedIn = useStore((state) => state.setIsAppWriteLoggedIn);
    const setFileId = useStore((state) => state.setFileId);
    
    const logout = () => {
        setIsAppWriteLoggedIn(false);
        setFileId(undefined);
    }
    return logout;
};

export default useLogout;
