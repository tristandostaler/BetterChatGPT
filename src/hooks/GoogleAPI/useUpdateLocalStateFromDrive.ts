import React from 'react';

import useStore from '@store/cloud-auth-store';
import useLocalStore from '@store/store';
import useGetFile from './useGetFile';

const useUpdateLocalStateFromDrive = (isLoginProcess: boolean, setCurrentlySaving: Function, isCurrentlySaving: Function) => {
    const getFile = useGetFile(isLoginProcess);
    const getCurrentChatIndex = () => { return useLocalStore.getState().currentChatIndex; }
    const setCurrentChatIndex = useLocalStore(state => state.setCurrentChatIndex);
    const setHideSideMenu = useLocalStore(state => state.setHideSideMenu);
    const getHideSideMenu = () => { return useLocalStore.getState().hideSideMenu; }

    const updateLocalStateFromDrive = () => {
        getFile().then((fileContent) => {
            if (!fileContent || isCurrentlySaving()) {
                return;
            }
            setCurrentlySaving(true);
            var state = JSON.parse(fileContent);
            var hsm = getHideSideMenu();
            var cci = getCurrentChatIndex();
            // console.log(state);
            useLocalStore.setState(state);
            setCurrentChatIndex(cci);
            setHideSideMenu(hsm);
            setCurrentlySaving(false);
        });
    }
    return updateLocalStateFromDrive;
};

export default useUpdateLocalStateFromDrive;
