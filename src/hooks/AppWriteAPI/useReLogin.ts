import React from 'react';

import useLogout from './useLogout';
import useStore from '@store/cloud-auth-store';
import useLogin from './useLogin';

const useReLogin = () => {
    const logout = useLogout();
    var login = useLogin();

    const reLogin = () => {
        logout();
        login();
    }
    return reLogin;
};

export default useReLogin;