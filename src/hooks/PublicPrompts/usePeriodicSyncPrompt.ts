import React from 'react';

import useStore from '@store/store';
import useSyncPrompt from './useSyncPrompt';


const usePeriodicSyncPrompt = () => {
    const setPrompts = useStore.getState().setPrompts;
    const syncPrompt = useSyncPrompt();

    const periodicSyncPrompt = () => {
        const prompts = useStore.getState().prompts;
        const privatePrompts = prompts.filter((prompt) => { return prompt.private });
        setPrompts(privatePrompts);
        var currentPrompts = useStore.getState().publicPrompts;
        currentPrompts.forEach(p => syncPrompt(p.source, p.name, false));
    }
    return periodicSyncPrompt;
};

export default usePeriodicSyncPrompt;

