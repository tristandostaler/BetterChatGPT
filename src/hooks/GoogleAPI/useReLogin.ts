import React from 'react';

import useLogin from './useLogin';
import useLogout from './useLogout';

const useReLogin = () => {
    const login = useLogin();
    const logout = useLogout();

    const reLogin = () => {
        logout();
        document.getElementById("settings")?.click();
    }
    return reLogin;
};

export default useReLogin;