import React from 'react';

import { googleLogout } from '@react-oauth/google';

import useStore from '@store/cloud-auth-store';

const useLogout = () => {
    const setIsAppWriteLoggedIn = useStore((state) => state.setIsAppWriteLoggedIn);
    const logout = () => {
        setIsAppWriteLoggedIn(false);
    }
    return logout;
};

export default useLogout;