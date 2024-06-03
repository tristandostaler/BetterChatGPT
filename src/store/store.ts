import { StoreApi, create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatSlice, createChatSlice } from './chat-slice';
import { InputSlice, createInputSlice } from './input-slice';
import { AuthSlice, createAuthSlice } from './auth-slice';
import { ConfigSlice, createConfigSlice } from './config-slice';
import { PromptSlice, createPromptSlice } from './prompt-slice';
import { ToastSlice, createToastSlice } from './toast-slice';
import { migrateState } from './migrate';
import stateVersion from '@constants/stateVersion';
import { createPublicPromptSlice, PublicPromptSlice } from './public-prompt-sync-slice';

export type StoreState = ChatSlice &
  InputSlice &
  AuthSlice &
  ConfigSlice &
  PromptSlice &
  PublicPromptSlice &
  ToastSlice;

export type StoreSlice<T> = (
  set: StoreApi<StoreState>['setState'],
  get: StoreApi<StoreState>['getState']
) => T;

const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...createChatSlice(set, get),
      ...createInputSlice(set, get),
      ...createAuthSlice(set, get),
      ...createConfigSlice(set, get),
      ...createPromptSlice(set, get),
      ...createPublicPromptSlice(set, get),
      ...createToastSlice(set, get),
    }),
    {
      name: 'free-chat-gpt',
      partialize: (state) => ({
        chats: state.chats,
        currentChatIndex: state.currentChatIndex,
        apiKey: state.apiKey,
        apiEndpoint: state.apiEndpoint,
        orgId: state.orgId,
        availableOrgIds: state.availableOrgIds,
        theme: state.theme,
        autoTitle: state.autoTitle,
        textToSpeech: state.textToSpeech,
        prompts: state.prompts,
        publicPrompts: state.publicPrompts,
        defaultChatConfig: state.defaultChatConfig,
        defaultSystemMessage: state.defaultSystemMessage,
        hideMenuOptions: state.hideMenuOptions,
        firstVisit: state.firstVisit,
        hideSideMenu: state.hideSideMenu,
        folders: state.folders,
        enterToSubmit: state.enterToSubmit,
      }),
      version: stateVersion,
      migrate: migrateState,
    }
  )
);

export default useStore;
