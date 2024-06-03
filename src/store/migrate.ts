import { v4 as uuidv4 } from 'uuid';

import {
  Folder,
  FolderCollection,
  LocalStorageInterfaceV0ToV1,
  LocalStorageInterfaceV12ToV13,
  LocalStorageInterfaceV13ToV14,
  LocalStorageInterfaceV1ToV2,
  LocalStorageInterfaceV2ToV3,
  LocalStorageInterfaceV3ToV4,
  LocalStorageInterfaceV4ToV5,
  LocalStorageInterfaceV5ToV6,
  LocalStorageInterfaceV6ToV7,
  LocalStorageInterfaceV7oV8,
  LocalStorageInterfaceV8ToV12,
  LocalStorageInterfaceV8ToV9,
} from '@type/chat';
import {
  _defaultChatConfig,
  defaultModel,
  defaultUserMaxToken,
} from '@constants/chat';
import { officialAPIEndpoint } from '@constants/auth';
import defaultPrompts from '@constants/prompt';
import { Prompt } from '@type/prompt';
import stateVersion from '@constants/stateVersion';
import defaultPublicPrompts from '@constants/publicPrompt';

export const migrateV0 = (persistedState: LocalStorageInterfaceV0ToV1) => {
  persistedState.chats.forEach((chat) => {
    chat.titleSet = false;
    if (!chat.config) chat.config = { ..._defaultChatConfig };
  });
};

export const migrateV1 = (persistedState: LocalStorageInterfaceV1ToV2) => {
  if (persistedState.apiFree) {
    persistedState.apiEndpoint = persistedState.apiFreeEndpoint;
  } else {
    persistedState.apiEndpoint = officialAPIEndpoint;
  }
};

export const migrateV2 = (persistedState: LocalStorageInterfaceV2ToV3) => {
  persistedState.chats.forEach((chat) => {
    chat.config = {
      ...chat.config,
      top_p: _defaultChatConfig.top_p,
      frequency_penalty: _defaultChatConfig.frequency_penalty,
    };
  });
  persistedState.autoTitle = false;
};

export const migrateV3 = (persistedState: LocalStorageInterfaceV3ToV4) => {
  persistedState.prompts = defaultPrompts;
};

export const migrateV4 = (persistedState: LocalStorageInterfaceV4ToV5) => {
  persistedState.chats.forEach((chat) => {
    chat.config = {
      ...chat.config,
      model: defaultModel,
    };
  });
};

export const migrateV5 = (persistedState: LocalStorageInterfaceV5ToV6) => {
  persistedState.chats.forEach((chat) => {
    chat.config = {
      ...chat.config,
      max_tokens: defaultUserMaxToken,
    };
  });
};

export const migrateV6 = (persistedState: LocalStorageInterfaceV6ToV7) => {
  if (
    persistedState.apiEndpoint ===
    'https://sharegpt.churchless.tech/share/v1/chat'
  ) {
    persistedState.apiEndpoint = 'https://chatgpt-api.shn.hk/v1/';
  }
  if (!persistedState.apiKey || persistedState.apiKey.length === 0)
    persistedState.apiKey = '';
};

export const migrateV7 = (persistedState: LocalStorageInterfaceV7oV8) => {
  let folders: FolderCollection = {};
  const folderNameToIdMap: Record<string, string> = {};

  // convert foldersExpanded and foldersName to folders
  persistedState.foldersName.forEach((name, index) => {
    const id = uuidv4();
    const folder: Folder = {
      id,
      name,
      expanded: persistedState.foldersExpanded[index],
      order: index,
    };

    folders = { [id]: folder, ...folders };
    folderNameToIdMap[name] = id;
  });
  persistedState.folders = folders;

  // change the chat.folder from name to id
  persistedState.chats.forEach((chat) => {
    if (chat.folder) chat.folder = folderNameToIdMap[chat.folder];
    chat.id = uuidv4();
  });
};

export const migrateV8 = (persistedState: LocalStorageInterfaceV8ToV9) => {
  // add the private variable to the prompts
  persistedState.prompts.forEach((p) => {
    if (p.private == undefined || p.private == null) {
      p.private = true;
      p.publicSourceId = '';
    }
  });
  persistedState.version = stateVersion;
};

export const migrateV12 = (persistedState: LocalStorageInterfaceV8ToV12) => {
  persistedState.publicPrompts = defaultPublicPrompts;
};

export const migrateV13 = (persistedState: LocalStorageInterfaceV12ToV13) => {
  persistedState.chats.forEach((chat) => {
    chat.messages.forEach((m) => {
      if (m.locked == undefined || m.locked == null) {
        m.locked = false;
      }
    })
  });
};

export const migrateV14 = (persistedState: LocalStorageInterfaceV13ToV14) => {
  persistedState.chats.forEach((chat) => {
    if(chat.config.model.toString() == "gpt-4-turbo-preview") {
      chat.config.model = 'gpt-4-turbo';
    }
  });
  if(persistedState.defaultChatConfig.model.toString() == "gpt-4-turbo-preview") {
    persistedState.defaultChatConfig.model = 'gpt-4-turbo';
  }
  persistedState.prompts.forEach((prompt) => {
    prompt.prompt = prompt.prompt.replaceAll("~ Model: gpt-4-turbo-preview ~", "~ Model: gpt-4-turbo ~")
  });

  persistedState.publicPrompts.forEach((prompt) => {
    prompt.source = prompt.source.replaceAll("~ Model: gpt-4-turbo-preview ~", "~ Model: gpt-4-turbo ~")
  });
};