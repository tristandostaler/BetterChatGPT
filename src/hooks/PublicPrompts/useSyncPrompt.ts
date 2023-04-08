import React from 'react';

import useStore from '@store/store';
import { importPromptCSV } from '@utils/prompt';
import { v4 as uuidv4 } from 'uuid';
import { sha1Hash } from '@utils/hash';


const useSyncPrompt = () => {
    const setPrompts = useStore.getState().setPrompts;
    const setPublicPrompts = useStore.getState().setPublicPrompts;

    const syncPrompt = async (url: string, name: string) => {
        return await fetch(url, {
            method: 'GET',
        }).then(res => {
            if (!res.ok) {
                return null;
            }
            return res.text();
        }).then(csv => {
            if (!csv) {
                return { message: 'An error occured fetching the CSV', isSuccess: false };
            }

            try {
                const results = importPromptCSV(csv);
                const prompts = useStore.getState().prompts;
                const publicPrompts = useStore.getState().publicPrompts;

                return sha1Hash(url).then((publicPromptId) => {
                    if (publicPrompts.filter(p => p.id === publicPromptId).length > 0) {
                        return { message: 'This source is already synced', isSuccess: false };
                    }
                    try {
                        const newPrompts = results.map((data) => {
                            const columns = Object.values(data);
                            return {
                                id: uuidv4(),
                                private: false,
                                publicSourceId: publicPromptId,
                                name: columns[0],
                                prompt: columns[1],
                            };
                        });

                        setPrompts(prompts.concat(newPrompts));

                        setPublicPrompts(publicPrompts.concat([{
                            id: publicPromptId,
                            name: name,
                            source: url,
                        }]));

                        return { message: 'Succesfully Synced and imported!', isSuccess: true };
                    } catch (error: unknown) {
                        return { message: (error as Error).message, isSuccess: false };
                    }
                });
            } catch (error: unknown) {
                return { message: (error as Error).message, isSuccess: false };
            }
        });
    }
    return syncPrompt;
};

export default useSyncPrompt;

