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
        for (var i = 0; i < currentPrompts.length; i++) {
            var p = currentPrompts[0];
            syncPrompt(p.source, p.name)
        }
    }
    return periodicSyncPrompt;
};

export default usePeriodicSyncPrompt;

