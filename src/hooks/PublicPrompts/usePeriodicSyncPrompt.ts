import React from 'react';

import useStore from '@store/store';
import { importPromptCSV } from '@utils/prompt';
import { v4 as uuidv4 } from 'uuid';
import useRemoveSyncPrompt from './useRemoveSyncPrompt';
import useSyncPrompt from './useSyncPrompt';


const usePeriodicSyncPrompt = () => {
    const syncPrompt = useSyncPrompt();
    const deletePublicPrompt = useRemoveSyncPrompt();

    const periodicSyncPrompt = () => {
        var currentPrompts = useStore.getState().publicPrompts;
        for (var i = 0; i < currentPrompts.length; i++) {
            var p = currentPrompts[0];
            deletePublicPrompt(0);
            syncPrompt(p.source, p.name)
        }
    }
    return periodicSyncPrompt;
};

export default usePeriodicSyncPrompt;

