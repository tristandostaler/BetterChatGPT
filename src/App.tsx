import React, { useEffect } from 'react';
import useStore, { StoreState } from '@store/store';
import useCloudAuthStore from '@store/cloud-auth-store'
import useUpdateFile from '@hooks/GoogleAPI/useUpdateFile';
import useUpdateLocalStateFromDrive from '@hooks/GoogleAPI/useUpdateLocalStateFromDrive';
import i18n from './i18n';

import Chat from '@components/Chat';
import Menu from '@components/Menu';

import useInitialiseNewChat from '@hooks/useInitialiseNewChat';
import { ChatInterface } from '@type/chat';
import { Theme } from '@type/theme';
import ApiPopup from '@components/ApiPopup';

import useReLogin from '@hooks/GoogleAPI/useReLogin';
import usePeriodicSyncPrompt from '@hooks/PublicPrompts/usePeriodicSyncPrompt';

// https://console.cloud.google.com/apis/dashboard?project=betterchatgpt
// https://console.cloud.google.com/apis/api/drive.googleapis.com/drive_sdk?project=betterchatgpt

function App() {
  function isCurrentlySaving() {
    return currentlySaving;
  }

  function setCurrentlySaving(status: boolean) {
    currentlySaving = status;
  }

  const updateFile = useUpdateFile();
  const updateLocalStateFromDrive = useUpdateLocalStateFromDrive(false, setCurrentlySaving, isCurrentlySaving);
  const initLocalStateFromDrive = useUpdateLocalStateFromDrive(false, setCurrentlySaving, () => { return false; });
  const initialiseNewChat = useInitialiseNewChat();
  const setChats = useStore((state) => state.setChats);
  const setTheme = useStore((state) => state.setTheme);
  const setApiKey = useStore((state) => state.setApiKey);
  const setCurrentChatIndex = useStore((state) => state.setCurrentChatIndex);
  const fileId = () => { return useCloudAuthStore.getState().fileId };
  const periodicSyncPrompt = usePeriodicSyncPrompt();
  var needToSave = false;
  var currentlySaving = true;
  var mostRecentState: StoreState | null = null;

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    i18n.on('languageChanged', (lng) => {
      document.documentElement.lang = lng;
    });
  }, []);

  useEffect(() => {
    const setup = async () => {
      // --------------- Section: Migration
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

      // --------------- Section: Google drive
      if (fileId()) {
        await initLocalStateFromDrive();
      }
      currentlySaving = false;

      function reset() {
        needToSave = false;
        currentlySaving = false;
        mostRecentState = null;
      }
      function save(state: any) {
        if (state && fileId()) {
          if (isCurrentlySaving()) {
            mostRecentState = state;
            needToSave = true;
            return;
          }

          currentlySaving = true;
          return updateFile(JSON.stringify(state)).then(r => {
            currentlySaving = false;
            if (needToSave) {
              needToSave = false;
              save(mostRecentState);
            } else {
              reset();
            }
          });
        } else {
          reset();
        }
      }
      useStore.subscribe((state, prevState) => {
        save(state)
      })
      setInterval(() => {
        if (fileId()) {
          updateLocalStateFromDrive(() => { if (needToSave) { save(mostRecentState); } });
        } else {
          reset();
        }
      }, 5 * 60 * 1000)

      // --------------- Section: Public prompt sync
      await periodicSyncPrompt();

      setInterval(periodicSyncPrompt, 5 * 60 * 1000);
    }

    setup().catch(console.error);
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
