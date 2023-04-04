import React, { useEffect } from 'react';
import useStore, { StoreState } from '@store/store';
import useCloudAuthStore from '@store/cloud-auth-store'
import { updateFile, updateLocalStateFromDrive } from '@api/google-api'
import i18n from './i18n';

import Chat from '@components/Chat';
import Menu from '@components/Menu';

import useInitialiseNewChat from '@hooks/useInitialiseNewChat';
import { ChatInterface } from '@type/chat';
import { Theme } from '@type/theme';
import ApiPopup from '@components/ApiPopup';

function App() {
  const initialiseNewChat = useInitialiseNewChat();
  const setChats = useStore((state) => state.setChats);
  const setTheme = useStore((state) => state.setTheme);
  const setApiKey = useStore((state) => state.setApiKey);
  const setCurrentChatIndex = useStore((state) => state.setCurrentChatIndex);
  const setState = useStore.setState;
  const getCurrentChatIndex = () => { return useStore.getState().currentChatIndex };
  const fileId = useCloudAuthStore((state) => state.fileId);
  const googleAccessToken = useCloudAuthStore((state) => state.googleAccessToken);
  var needToSave = false;
  var currentlySaving = false;
  var mostRecentState: StoreState | null = null;

  function isCurrentlySaving() {
    return currentlySaving;
  }

  function setCurrentlySaving(status: boolean) {
    currentlySaving = status;
  }

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    i18n.on('languageChanged', (lng) => {
      document.documentElement.lang = lng;
    });
  }, []);

  useEffect(() => {
    // legacy local storage
    const oldChats = localStorage.getItem('chats');
    const apiKey = localStorage.getItem('apiKey');
    const theme = localStorage.getItem('theme');

    if (apiKey) {
      // legacy local storage
      setApiKey(apiKey);
      localStorage.removeItem('apiKey');
    }

    if (theme) {
      // legacy local storage
      setTheme(theme as Theme);
      localStorage.removeItem('theme');
    }

    if (oldChats) {
      // legacy local storage
      try {
        const chats: ChatInterface[] = JSON.parse(oldChats);
        if (chats.length > 0) {
          setChats(chats);
          setCurrentChatIndex(0);
        } else {
          initialiseNewChat();
        }
      } catch (e: unknown) {
        console.log(e);
        initialiseNewChat();
      }
      localStorage.removeItem('chats');
    } else {
      // existing local storage
      const chats = useStore.getState().chats;
      const currentChatIndex = useStore.getState().currentChatIndex;
      if (!chats || chats.length === 0) {
        initialiseNewChat();
      }
      if (
        chats &&
        !(currentChatIndex >= 0 && currentChatIndex < chats.length)
      ) {
        setCurrentChatIndex(0);
      }
    }
  }, []);

  useEffect(() => {
    if (fileId && googleAccessToken && !isCurrentlySaving()) {
      updateLocalStateFromDrive(googleAccessToken, fileId, setCurrentChatIndex, getCurrentChatIndex, setState, setCurrentlySaving);
    }

    function reset() {
      needToSave = false;
      currentlySaving = false;
      mostRecentState = null;
    }
    function save(state: any) {
      if (state && fileId && googleAccessToken) {
        return updateFile(googleAccessToken, fileId, JSON.stringify(state)).then(r => {
          if (needToSave) {
            save(mostRecentState)?.then(r => reset());
          } else {
            reset()
          }
        });
      }
    }
    useStore.subscribe((state, prevState) => {
      if (isCurrentlySaving()) {
        mostRecentState = state;
        needToSave = true;
      }
      else {
        currentlySaving = true;
        save(state)
      }
    })
    setInterval(() => {
      if (fileId && googleAccessToken && !isCurrentlySaving()) {
        updateLocalStateFromDrive(googleAccessToken, fileId, setCurrentChatIndex, getCurrentChatIndex, setState, setCurrentlySaving);
      }
    }, 10 * 1000)
  }, []);

  return (
    <div className='overflow-hidden w-full h-full relative'>
      <Menu />
      <Chat />
      <ApiPopup />
    </div>
  );
}

export default App;
