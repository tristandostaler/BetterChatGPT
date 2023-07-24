import React, { useEffect, useRef, useState } from 'react';
import useStore, { StoreState } from '@store/store';
import useCloudAuthStore from '@store/cloud-auth-store';

import useUpdateFileGoogle from '@hooks/GoogleAPI/useUpdateFile';
import useUpdateLocalStateFromDriveGoogle from '@hooks/GoogleAPI/useUpdateLocalStateFromDrive';
import useUpdateFileAppWrite from '@hooks/AppWriteAPI/useUpdateFile';
import useUpdateLocalStateFromDriveAppWrite from '@hooks/AppWriteAPI/useUpdateLocalStateFromDrive';

import i18n from './i18n';

import Chat from '@components/Chat';
import Menu from '@components/Menu';

import useInitialiseNewChat from '@hooks/useInitialiseNewChat';
import { ChatInterface } from '@type/chat';
import { Theme } from '@type/theme';
import ApiPopup from '@components/ApiPopup';

import usePeriodicSyncPrompt from '@hooks/PublicPrompts/usePeriodicSyncPrompt';
import Toast from '@components/Toast';
import { fileIdAppWriteMarker } from '@hooks/AppWriteAPI/client';

import Semaphore from 'ts-semaphore';
import LogRocket from 'logrocket';
import { md5Hash } from '@utils/hash';

// https://console.cloud.google.com/apis/dashboard?project=betterchatgpt
// https://console.cloud.google.com/apis/api/drive.googleapis.com/drive_sdk?project=betterchatgpt

function App() {
  function isCurrentlySaving() {
    return currentlySaving;
  }

  function setCurrentlySaving(status: boolean) {
    currentlySaving = status;
  }

  const fileId = () => { return useCloudAuthStore.getState().fileId };

  const isAppWrite = () => {
    var fileIdTemp = fileId() ?? ""
    return fileIdTemp && fileIdTemp.startsWith(fileIdAppWriteMarker);
  }

  const isGoogleDrive = () => {
    var fileIdTemp = fileId() ?? ""
    return (!isAppWrite() && fileIdTemp != "")
  }

  const updateFileAppWrite = useUpdateFileAppWrite();
  const updateFileGoogle = useUpdateFileGoogle();
  const updateFile = async (fileContent: string) => {
    if (isAppWrite()) {
      return updateFileAppWrite(fileContent);
    } else if (isGoogleDrive()) {
      return updateFileGoogle(fileContent);
    }
  }

  const updateLocalStateFromDriveAppWrite = useUpdateLocalStateFromDriveAppWrite(false, setCurrentlySaving, isCurrentlySaving);
  const updateLocalStateFromDriveGoogle = useUpdateLocalStateFromDriveGoogle(false, setCurrentlySaving, isCurrentlySaving);
  const updateLocalStateFromDrive = (savingSyncSemaphoreFunction: Function, actionToRunWhenDone: Function = () => { }) => {
    if (isAppWrite()) {
      return updateLocalStateFromDriveAppWrite(savingSyncSemaphoreFunction, "", actionToRunWhenDone);
    } else if (isGoogleDrive()) {
      return updateLocalStateFromDriveGoogle(savingSyncSemaphoreFunction, actionToRunWhenDone);
    }
  }

  const initLocalStateFromDriveAppWrite = useUpdateLocalStateFromDriveAppWrite(false, setCurrentlySaving, () => { return false; });
  const initLocalStateFromDriveGoogle = useUpdateLocalStateFromDriveGoogle(false, setCurrentlySaving, () => { return false; });
  const initLocalStateFromDrive = (actionToRunWhenDone: Function = () => { }) => {
    if (isAppWrite()) {
      return initLocalStateFromDriveAppWrite(() => { }, "", actionToRunWhenDone);
    } else if (isGoogleDrive()) {
      return initLocalStateFromDriveGoogle(() => { }, actionToRunWhenDone);
    }
  }

  const initialiseNewChat = useInitialiseNewChat();
  const setChats = useStore((state) => state.setChats);
  const setTheme = useStore((state) => state.setTheme);
  const setApiKey = useStore((state) => state.setApiKey);
  const setCurrentChatIndex = useStore((state) => state.setCurrentChatIndex);

  const _apiKey = useStore((state) => state.apiKey);

  const periodicSyncPrompt = usePeriodicSyncPrompt();
  var needToSave = false;
  var currentlySaving = true;
  var savingSyncSemaphore = new Semaphore(1);
  var isSyncing = false;
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

      // --------------- Section: Google drive and AppWrite
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
      useStore.subscribe(async (state, prevState) => {
        if (await savingSyncSemaphore.use(() => { if (isSyncing) { isSyncing = false; return true; } return false; })) {
          return;
        }
        save(state);
      })
      setInterval(() => {
        if (fileId()) {
          updateLocalStateFromDrive(async () => { await savingSyncSemaphore.use(() => { isSyncing = true; }) }, () => { if (needToSave) { save(mostRecentState); } });
        } else {
          reset();
        }
      }, (isAppWrite() ? 1 : 5) * 60 * 1000)

      // --------------- Section: Public prompt sync
      await periodicSyncPrompt();

      setInterval(periodicSyncPrompt, 5 * 60 * 1000);
    }

    setup().catch(console.error);
  }, []);

  const getAppWriteIdentification = () => {
    if (_apiKey === undefined || _apiKey === "") {
      return ""
    }
    const apiKeyHashed = md5Hash(_apiKey ?? "");
    var email = apiKeyHashed + '@tristandostaler.com';
    return email
  }

  const logRocketIdentify = (email: string) => {
    LogRocket.identify(email, {
      name: email,
      email: email,

      // TODO: Add your own custom user variables here, ie:
      // ex: subscriptionType: 'pro'
    });
  }

  useEffect(() => {
    LogRocket.init('wi5hrl/betterchatgpt');
  }, []);

  useEffect(() => {
    const email = getAppWriteIdentification();
    logRocketIdentify(email);
  }, [_apiKey]);

  return (
    <div className='overflow-hidden w-full h-full relative'>
      <Menu />
      <Chat />
      <ApiPopup />
      <Toast />
    </div>
  );
}

export default App;
