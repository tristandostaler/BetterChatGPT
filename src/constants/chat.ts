import { v4 as uuidv4 } from 'uuid';
import { ChatInterface, ConfigInterface, ModelOptions } from '@type/chat';
import useStore from '@store/store';

const date = new Date();
const dateString =
  date.getFullYear() +
  '-' +
  ('0' + (date.getMonth() + 1)).slice(-2) +
  '-' +
  ('0' + date.getDate()).slice(-2);

// default system message obtained using the following method: https://twitter.com/DeminDimin/status/1619935545144279040
export const _defaultSystemMessage =
  import.meta.env.VITE_DEFAULT_SYSTEM_MESSAGE ??
  '{{SystemPrompt}}';

export const modelCost = {
  'gpt-3.5-turbo-16k': {
    prompt: { price: 0.003, unit: 1000 },
    completion: { price: 0.004, unit: 1000 },
    modelMaxToken: 16384,
  },
  'gpt-3.5-turbo': {
    prompt: { price: 0.002, unit: 1000 },
    completion: { price: 0.002, unit: 1000 },
    modelMaxToken: 4096,
  },
  'gpt-4': {
    prompt: { price: 0.03, unit: 1000 },
    completion: { price: 0.06, unit: 1000 },
    modelMaxToken: 8192,
  },
  'gpt-4-turbo': {
    prompt: { price: 0.01, unit: 1000 },
    completion: { price: 0.03, unit: 1000 },
    modelMaxToken: 128000,
  },
  'gpt-4o': {
    prompt: { price: 0.005, unit: 1000 },
    completion: { price: 0.015, unit: 1000 },
    modelMaxToken: 128000,
  },
  'gpt-4o-mini': {
    prompt: { price: 0.00015, unit: 1000 },
    completion: { price: 0.006, unit: 1000 },
    modelMaxToken: 128000,
  }
};

export const modelOptions: ModelOptions[] = Object.keys(modelCost) as ModelOptions[];

export const defaultModel = 'gpt-3.5-turbo-16k';

export const minResponseSize = 500;

export const defaultUserMaxToken = 16384;

export const _defaultChatConfig: ConfigInterface = {
  model: defaultModel,
  orgId: '',
  max_tokens: defaultUserMaxToken,
  temperature: 0.7,
  presence_penalty: 0,
  top_p: 1,
  frequency_penalty: 0,
};

export const generateDefaultChat = (title?: string, folder?: string): ChatInterface => ({
  id: uuidv4(),
  title: title ? title : 'New Chat',
  messages:
    useStore.getState().defaultSystemMessage.length > 0
      ? [{ role: 'system', content: useStore.getState().defaultSystemMessage, locked: true }]
      : [],
  config: { ...useStore.getState().defaultChatConfig },
  titleSet: false,
  folder
});

export const codeLanguageSubset = [
  'python',
  'javascript',
  'java',
  'go',
  'bash',
  'c',
  'cpp',
  'csharp',
  'css',
  'diff',
  'graphql',
  'json',
  'kotlin',
  'less',
  'lua',
  'makefile',
  'markdown',
  'objectivec',
  'perl',
  'php',
  'php-template',
  'plaintext',
  'python-repl',
  'r',
  'ruby',
  'rust',
  'scss',
  'shell',
  'sql',
  'swift',
  'typescript',
  'vbnet',
  'wasm',
  'xml',
  'yaml',
];
