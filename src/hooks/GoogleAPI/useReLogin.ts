import React from 'react';

import useLogout from './useLogout';
import useStore from '@store/cloud-auth-store';

const useReLogin = () => {
    const logout = useLogout();
    const googleRefreshTokenExpirationTime = useStore((state) => state.googleRefreshTokenExpirationTime);

    const reLogin = () => {
        if (Date.now() >= (googleRefreshTokenExpirationTime ?? 0)) {
            logout();
        }
        document.getElementById("settings")?.click();
    }
    return reLogin;
};

export default useReLogin;