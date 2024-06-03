import React from 'react';

import useStore from '@store/cloud-auth-store';
import useLocalStore from '@store/store';
import useGetFile from './useGetFile';
import { migrateState, migrateV8 } from './migrate';
import { LocalStorageInterfaceV8ToV9 } from '@type/chat';

const useUpdateLocalStateFromDrive = (isLoginProcess: boolean, setCurrentlySaving: Function, isCurrentlySaving: Function) => {
    const getFile = useGetFile(isLoginProcess);
    const getCurrentChatIndex = () => { return useLocalStore.getState().currentChatIndex; }
    const setCurrentChatIndex = useLocalStore(state => state.setCurrentChatIndex);
    const setHideSideMenu = useLocalStore(state => state.setHideSideMenu);
    const getHideSideMenu = () => { return useLocalStore.getState().hideSideMenu; }
    const setToastStatus = useLocalStore((state) => state.setToastStatus);
    const getToastStatus = () => { return useLocalStore.getState().toastStatus; }
    const setToastMessage = useLocalStore((state) => state.setToastMessage);
    const getToastMessage = () => { return useLocalStore.getState().toastMessage; }
    const setToastShow = useLocalStore((state) => state.setToastShow);
    const getToastShow = () => { return useLocalStore.getState().toastShow; }

    const updateLocalStateFromDrive = (savingSyncSemaphoreFunction: Function, actionToRunWhenDone: Function = () => { }) => {
        if (isCurrentlySaving()) {
            return;
        }
        setCurrentlySaving(true);
        return getFile().then((fileContent) => {
            if (!fileContent) {
                return;
            }
            var state = JSON.parse(fileContent);

            if (!state.version) {
                migrateV8(state as LocalStorageInterfaceV8ToV9);
            }
            else if(state.version < stateVersion){
                migrateState(state, state.version);
            }

            var hsm = getHideSideMenu();
            var cci = getCurrentChatIndex();
            var tm = getToastMessage();
            var tsw = getToastShow();
            var ts = getToastStatus();
            // console.log(state);
            savingSyncSemaphoreFunction();
            useLocalStore.setState(state);
            setCurrentChatIndex(cci);
            setHideSideMenu(hsm);
            setToastMessage(tm);
            setToastShow(tsw);
            setToastStatus(ts);
        }).finally(() => { setCurrentlySaving(false); actionToRunWhenDone(); });
    }
    return updateLocalStateFromDrive;
};

export default useUpdateLocalStateFromDrive;
