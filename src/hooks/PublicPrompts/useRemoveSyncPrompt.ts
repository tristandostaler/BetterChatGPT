import React from 'react';

import useStore from '@store/store';
import { PublicPrompt } from '@type/public-prompt';


const useRemoveSyncPrompt = () => {
    const setPrompts = useStore.getState().setPrompts;
    const setPublicPrompts = useStore.getState().setPublicPrompts;

    const removeSyncPrompt = (index: number) => {
        const prompts = useStore.getState().prompts;
        const publicPrompts = useStore.getState().publicPrompts;
        var removedPublicPropt = publicPrompts[index];
        const updatedPublicPrompts: PublicPrompt[] = JSON.parse(JSON.stringify(publicPrompts));
        updatedPublicPrompts.splice(index, 1);
        var filteredPrompts = prompts.filter((prompt, index, array) => {
            return prompt.private || prompt.publicSourceId != removedPublicPropt.id
        });
        setPublicPrompts(updatedPublicPrompts);
        setPrompts(filteredPrompts);
    };
    return removeSyncPrompt;
};

export default useRemoveSyncPrompt;
