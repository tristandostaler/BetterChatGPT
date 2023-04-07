import React from 'react';

import { googleLogout } from '@react-oauth/google';

import useStore from '@store/cloud-auth-store';

const useLogout = () => {
    const setGoogleAccessToken = useStore((state) => state.setGoogleAccessToken);
    const logout = () => {
        setGoogleAccessToken(undefined);
        googleLogout();
    }
    return logout;
};

export default useLogout;