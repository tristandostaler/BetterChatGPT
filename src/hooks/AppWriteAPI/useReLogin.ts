import React from 'react';

import useLogout from './useLogout';
import useStore from '@store/cloud-auth-store';
import useLogin from './useLogin';
import { sleep } from '@utils/utils';

const useReLogin = () => {
    const logout = useLogout();
    var login = useLogin();

    const reLogin = (reason: any) => {
        console.log(reason);
        return sleep(1000).then(() => {
            logout();
            login();
        });
    }
    return reLogin;
};

export default useReLogin;