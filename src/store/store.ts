import { StoreApi, create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatSlice, createChatSlice } from './chat-slice';
import { InputSlice, createInputSlice } from './input-slice';
import { AuthSlice, createAuthSlice } from './auth-slice';
import { ConfigSlice, createConfigSlice } from './config-slice';
import { PromptSlice, createPromptSlice } from './prompt-slice';
import { ToastSlice, createToastSlice } from './toast-slice';
import {
  LocalStorageInterfaceV0ToV1,
  LocalStorageInterfaceV1ToV2,
  LocalStorageInterfaceV2ToV3,
  LocalStorageInterfaceV3ToV4,
  LocalStorageInterfaceV4ToV5,
  LocalStorageInterfaceV5ToV6,
  LocalStorageInterfaceV6ToV7,
  LocalStorageInterfaceV7oV8,
  LocalStorageInterfaceV8ToV9,
  LocalStorageInterfaceV8ToV12,
  LocalStorageInterfaceV12ToV13,
} from '@type/chat';
import {
  migrateV0,
  migrateV1,
  migrateV2,
  migrateV3,
  migrateV4,
  migrateV5,
  migrateV6,
  migrateV7,
  migrateV8,
  migrateV12,
  migrateV13,
} from './migrate';
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
      migrate: (persistedState, version) => {
        switch (version) {
          case 0:
            migrateV0(persistedState as LocalStorageInterfaceV0ToV1);
            break;
          case 1:
            migrateV1(persistedState as LocalStorageInterfaceV1ToV2);
            break;
          case 2:
            migrateV2(persistedState as LocalStorageInterfaceV2ToV3);
            break;
          case 3:
            migrateV3(persistedState as LocalStorageInterfaceV3ToV4);
            break;
          case 4:
            migrateV4(persistedState as LocalStorageInterfaceV4ToV5);
            break;
          case 5:
            migrateV5(persistedState as LocalStorageInterfaceV5ToV6);
            break;
          case 6:
            migrateV6(persistedState as LocalStorageInterfaceV6ToV7);
            break;
          case 7:
            migrateV7(persistedState as LocalStorageInterfaceV7oV8);
            break;
          case 8:
          case 9:
          case 10:
            migrateV8(persistedState as LocalStorageInterfaceV8ToV9);
            migrateV12(persistedState as LocalStorageInterfaceV8ToV12);
            break;
          case 11:
            migrateV12(persistedState as LocalStorageInterfaceV8ToV12);
            break;
          case 12:
            migrateV13(persistedState as LocalStorageInterfaceV12ToV13);
            break;
        }
        return persistedState as StoreState;
      },
    }
  )
);

export default useStore;
