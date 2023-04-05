import defaultPublicPrompts from '@constants/publicPrompt';
import { PublicPrompt } from '@type/public-prompt';
import { StoreSlice } from './store';

export interface PublicPromptSlice {
    publicPrompts: PublicPrompt[];
    setPublicPrompts: (publicPrompts: PublicPrompt[]) => void;
}

export const createPublicPromptSlice: StoreSlice<PublicPromptSlice> = (set, get) => ({
    publicPrompts: defaultPublicPrompts,
    setPublicPrompts: (publicPrompts: PublicPrompt[]) => {
        set((prev: PublicPromptSlice) => ({
            ...prev,
            publicPrompts: publicPrompts,
        }));
    },
});
