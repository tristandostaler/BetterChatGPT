import { Prompt } from './prompt';
import { PublicPrompt } from './public-prompt';
import { Theme } from './theme';

export type Role = 'user' | 'assistant' | 'system' | 'function';
export const roles: Role[] = ['user', 'assistant', 'system'];

export interface MessageInterface {
  role: Role;
  content: string;
  name?: string;
  function_call?: {
    name: string;
    arguments: any;
  }
  locked?: Boolean; // If true, this chat will never get removed when the tokens limit is reached
}

export interface ChatInterface {
  id: string;
  title: string;
  folder?: string;
  messages: MessageInterface[];
  config: ConfigInterface;
  titleSet: boolean;
}

export interface ConfigInterface {
  model: ModelOptions;
  orgId?: string;
  max_tokens: number;
  temperature: number;
  presence_penalty: number;
  top_p: number;
  frequency_penalty: number;
}

export interface ChatHistoryInterface {
  title: string;
  index: number;
  id: string;
}

export interface ChatHistoryFolderInterface {
  [folderId: string]: ChatHistoryInterface[];
}

export interface FolderCollection {
  [folderId: string]: Folder;
}

export interface Folder {
  id: string;
  name: string;
  expanded: boolean;
  order: number;
  color?: string;
}

export type ModelOptions = 'gpt-4' | 'gpt-4-32k' | 'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k' | 'gpt-4-1106-preview' | 'gpt-4-turbo-preview' ;
// | 'gpt-3.5-turbo-0301';
// | 'gpt-4-0314'
// | 'gpt-4-32k-0314'

export interface LocalStorageInterfaceV0ToV1 {
  chats: ChatInterface[];
  currentChatIndex: number;
  apiKey: string;
  apiFree: boolean;
  apiFreeEndpoint: string;
  theme: Theme;
}

export interface LocalStorageInterfaceV1ToV2 {
  chats: ChatInterface[];
  currentChatIndex: number;
  apiKey: string;
  apiFree: boolean;
  apiFreeEndpoint: string;
  apiEndpoint?: string;
  theme: Theme;
}

export interface LocalStorageInterfaceV2ToV3 {
  chats: ChatInterface[];
  currentChatIndex: number;
  apiKey: string;
  apiFree: boolean;
  apiFreeEndpoint: string;
  apiEndpoint?: string;
  theme: Theme;
  autoTitle: boolean;
}
export interface LocalStorageInterfaceV3ToV4 {
  chats: ChatInterface[];
  currentChatIndex: number;
  apiKey: string;
  apiFree: boolean;
  apiFreeEndpoint: string;
  apiEndpoint?: string;
  theme: Theme;
  autoTitle: boolean;
  prompts: Prompt[];
}

export interface LocalStorageInterfaceV4ToV5 {
  chats: ChatInterface[];
  currentChatIndex: number;
  apiKey: string;
  apiFree: boolean;
  apiFreeEndpoint: string;
  apiEndpoint?: string;
  theme: Theme;
  autoTitle: boolean;
  prompts: Prompt[];
}

export interface LocalStorageInterfaceV5ToV6 {
  chats: ChatInterface[];
  currentChatIndex: number;
  apiKey: string;
  apiFree: boolean;
  apiFreeEndpoint: string;
  apiEndpoint?: string;
  theme: Theme;
  autoTitle: boolean;
  prompts: Prompt[];
}

export interface LocalStorageInterfaceV6ToV7 {
  chats: ChatInterface[];
  currentChatIndex: number;
  apiFree?: boolean;
  apiKey: string;
  apiEndpoint: string;
  theme: Theme;
  autoTitle: boolean;
  prompts: Prompt[];
  defaultChatConfig: ConfigInterface;
  defaultSystemMessage: string;
  hideMenuOptions: boolean;
  firstVisit: boolean;
  hideSideMenu: boolean;
}

export interface LocalStorageInterfaceV7oV8
  extends LocalStorageInterfaceV6ToV7 {
  foldersName: string[];
  foldersExpanded: boolean[];
  folders: FolderCollection;
}

export interface LocalStorageInterfaceV8ToV9
  extends LocalStorageInterfaceV7oV8 {
  version: number;
}

export interface LocalStorageInterfaceV8ToV12
  extends LocalStorageInterfaceV8ToV9 {
  publicPrompts: PublicPrompt[];
}

export interface LocalStorageInterfaceV12ToV13
  extends LocalStorageInterfaceV8ToV12 {
}

