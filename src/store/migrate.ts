import { v4 as uuidv4 } from 'uuid';

import {
  Folder,
  FolderCollection,
  LocalStorageInterfaceV0ToV1,
  LocalStorageInterfaceV12ToV13,
  LocalStorageInterfaceV13ToV14,
  LocalStorageInterfaceV14ToV16,
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
import { StoreState } from '@store/store';

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

export const migrateV15 = (persistedState: LocalStorageInterfaceV14ToV15) => {
  persistedState.chats.forEach((chat) => {
    if(chat.config.model.toString() == "gpt-3.5-turbo" || chat.config.model.toString() == "gpt-3.5-turbo-16k") {
      chat.config.model = 'gpt-4o-mini';
    }
  });
  if(persistedState.defaultChatConfig.model.toString() == "gpt-3.5-turbo" || persistedState.defaultChatConfig.model.toString() == "gpt-3.5-turbo-16k") {
    persistedState.defaultChatConfig.model = 'gpt-4o-mini';
  }
  persistedState.prompts.forEach((prompt) => {
    prompt.prompt = prompt.prompt.replaceAll("~ Model: gpt-3.5-turbo-16k ~", "~ Model: gpt-4o-mini ~");
    prompt.prompt = prompt.prompt.replaceAll("~ Model: gpt-3.5-turbo ~", "~ Model: gpt-4o-mini ~");
  });

  persistedState.publicPrompts.forEach((prompt) => {
    prompt.source = prompt.source.replaceAll("~ Model: gpt-3.5-turbo-16k ~", "~ Model: gpt-4o-mini ~")
    prompt.source = prompt.source.replaceAll("~ Model: gpt-3.5-turbo ~", "~ Model: gpt-4o-mini ~")
  });
};

export const migrateState = (persistedState: any, version: number) => {
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
    case 13:
      migrateV14(persistedState as LocalStorageInterfaceV13ToV14);
      break;
    case 14:
      migrateV14(persistedState as LocalStorageInterfaceV13ToV14);
      break;
    case 15:
      migrateV15(persistedState as LocalStorageInterfaceV14ToV16);
      break;
  }
  return persistedState as StoreState;
}