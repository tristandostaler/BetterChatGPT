import React from 'react';

import useStore from '@store/cloud-auth-store';
import useLocalStore from '@store/store';
import useGetFile from './useGetFile';

const useUpdateLocalStateFromDrive = (isLoginProcess: boolean, setCurrentlySaving: Function) => {
    const getFile = useGetFile(isLoginProcess);
    const getCurrentChatIndex = () => { useLocalStore(state => state.currentChatIndex); }
    const setCurrentChatIndex = useLocalStore(state => state.setCurrentChatIndex);
    const setHideSideMenu = useLocalStore(state => state.setHideSideMenu);
    const getHideSideMenu = () => { useLocalStore(state => state.hideSideMenu); }

    const updateLocalStateFromDrive = () => {
        setCurrentlySaving(true);
        getFile().then((fileContent) => {
            if (!fileContent) {
                return;
            }
            var state = JSON.parse(fileContent);
            // console.log(state);
            useLocalStore.setState(state);
            setCurrentChatIndex(getCurrentChatIndex());
            setHideSideMenu(getHideSideMenu());
            setCurrentlySaving(false);
        });
    }
    return updateLocalStateFromDrive;
};

export default useUpdateLocalStateFromDrive;
