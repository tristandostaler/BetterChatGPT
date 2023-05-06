import React from 'react';

import useLogout from './useLogout';
import useStore from '@store/cloud-auth-store';

const useReLogin = () => {
    const logout = useLogout();


    const reLogin = () => {

        document.getElementById("settings")?.click();
    }
    return reLogin;
};

export default useReLogin;