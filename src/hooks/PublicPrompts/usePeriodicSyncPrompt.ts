import React from 'react';

import useStore from '@store/store';
import useSyncPrompt from './useSyncPrompt';


const usePeriodicSyncPrompt = () => {
    const setPrompts = useStore((state) => state.setPrompts);
    const syncPrompt = useSyncPrompt();
    const getPrompts = () => { return useStore.getState().prompts };


    const periodicSyncPrompt = async () => {
        const privatePrompts = getPrompts().filter((prompt) => { return prompt.private });
        setPrompts(privatePrompts);
        var currentPrompts = useStore.getState().publicPrompts;
        currentPrompts.forEach(async (p, index) => { await syncPrompt(p.source, p.name, false) });
    }
    return periodicSyncPrompt;
};

export default usePeriodicSyncPrompt;

