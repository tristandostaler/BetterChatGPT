import React from 'react';

import useStore from '@store/cloud-auth-store';
import useLocalStore from '@store/store';
import useGetFile from './useGetFile';
import { migrateV12, migrateV13, migrateV8 } from '@store/migrate';
import { LocalStorageInterfaceV12ToV13, LocalStorageInterfaceV8ToV12, LocalStorageInterfaceV8ToV9 } from '@type/chat';

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

    const updateLocalStateFromDrive = (savingSyncSemaphoreFunction: Function, fileName: string = "", actionToRunWhenDone: Function = () => { }) => {
        if (isCurrentlySaving()) {
            return;
        }
        setCurrentlySaving(true);

        return getFile(fileName).then((state) => {
            if (!state) {
                return;
            }

            if (!state.version) {
                migrateV8(state as LocalStorageInterfaceV8ToV9);
            }
            else {
                switch (state.version) {
                    case 8:
                    case 9:
                    case 10:
                        migrateV8(state as LocalStorageInterfaceV8ToV9);
                        migrateV12(state as LocalStorageInterfaceV8ToV12);
                        break;
                    case 11:
                        migrateV12(state as LocalStorageInterfaceV8ToV12);
                        break;
                    case 12:
                        migrateV13(state as LocalStorageInterfaceV12ToV13);
                        break;
                }
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
