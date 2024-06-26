import { StoreSlice } from './store';
import { Theme } from '@type/theme';
import { ConfigInterface } from '@type/chat';
import { _defaultChatConfig, _defaultSystemMessage } from '@constants/chat';
import stateVersion from '@constants/stateVersion';

export interface ConfigSlice {
  openConfig: boolean;
  theme: Theme;
  autoTitle: boolean;
  textToSpeech: boolean;
  hideMenuOptions: boolean;
  defaultChatConfig: ConfigInterface;
  defaultSystemMessage: string;
  hideSideMenu: boolean;
  enterToSubmit: boolean;
  version: number;
  setOpenConfig: (openConfig: boolean) => void;
  setTheme: (theme: Theme) => void;
  setAutoTitle: (autoTitle: boolean) => void;
  setTextToSpeech: (textToSpeech: boolean) => void;
  setDefaultChatConfig: (defaultChatConfig: ConfigInterface) => void;
  setDefaultSystemMessage: (defaultSystemMessage: string) => void;
  setHideMenuOptions: (hideMenuOptions: boolean) => void;
  setHideSideMenu: (hideSideMenu: boolean) => void;
  setEnterToSubmit: (enterToSubmit: boolean) => void;
}

export const createConfigSlice: StoreSlice<ConfigSlice> = (set, get) => ({
  openConfig: false,
  theme: 'dark',
  hideMenuOptions: false,
  hideSideMenu: false,
  autoTitle: true,
  textToSpeech: false,
  enterToSubmit: true,
  version: stateVersion,
  defaultChatConfig: _defaultChatConfig,
  defaultSystemMessage: _defaultSystemMessage,
  setOpenConfig: (openConfig: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      openConfig: openConfig,
    }));
  },
  setTheme: (theme: Theme) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      theme: theme,
    }));
  },
  setAutoTitle: (autoTitle: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      autoTitle: autoTitle,
    }));
  },
  setTextToSpeech: (textToSpeech: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      textToSpeech: textToSpeech,
    }));
  },
  setDefaultChatConfig: (defaultChatConfig: ConfigInterface) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      defaultChatConfig: defaultChatConfig,
    }));
  },
  setDefaultSystemMessage: (defaultSystemMessage: string) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      defaultSystemMessage: defaultSystemMessage,
    }));
  },
  setHideMenuOptions: (hideMenuOptions: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      hideMenuOptions: hideMenuOptions,
    }));
  },
  setHideSideMenu: (hideSideMenu: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      hideSideMenu: hideSideMenu,
    }));
  },
  setEnterToSubmit: (enterToSubmit: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      enterToSubmit: enterToSubmit,
    }));
  },
});
