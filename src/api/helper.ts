import { modelOptions } from '@constants/chat';
import { EventSourceData } from '@type/api';
import { ConfigInterface, MessageInterface } from '@type/chat';
import { HelperPromptText, SystemPromptText } from '@constants/prompt';

const regexes = {
  'tokens': /(?:~ Max Tokens: (?<match>[0-9]+) ~)/gm,
  'temp': /(?:~ Temperature: (?<match>[0-9\.]+) ~)/gm,
  'topp': /(?:~ Top-p: (?<match>[0-9\.]+) ~)/gm,
  'presence': /(?:~ Presence Penalty: (?<match>[0-9\.]+) ~)/gm,
  'frequency': /(?:~ Frequency Penalty: (?<match>[0-9\.]+) ~)/gm,
}

export const parseEventSource = (
  data: string
): '[DONE]' | EventSourceData[] => {
  const result = data
    .split('\n\n')
    .filter(Boolean)
    .map((chunk) => {
      const jsonString = chunk
        .split('\n')
        .map((line) => line.replace(/^data: /, ''))
        .join('');
      if (jsonString === '[DONE]') return jsonString;
      try {
        const json = JSON.parse(jsonString);
        return json;
      } catch {
        return jsonString;
      }
    });
  return result;
};

export const replaceDynamicContentInMessages = (
  messages: MessageInterface[],
  config: ConfigInterface,
): MessageInterface[] => {
  const transformedMessages: MessageInterface[] = [];
  const now = new Date();
  const replacements = {
    'date': now.toLocaleDateString(),
    'datetime': now.toLocaleString(),
    'dateiso': now.toISOString(),
    'model': config.model,
    'HelperPrompt': HelperPromptText,
    'SystemPrompt': SystemPromptText,
  }

  messages.forEach((m) => {
    var newContent = m.content.replace(regexes.tokens, '')
      .replace(regexes.temp, '')
      .replace(regexes.topp, '')
      .replace(regexes.presence, '')
      .replace(regexes.frequency, '');

    for (let i = 0; i < 3; i++) { // If a replacement has other raplcements, ex: systemprompt uses model and date
      for (let [key, value] of Object.entries(replacements)) {
        newContent = newContent.replaceAll('{{' + key + '}}', value);
      }
    }
    var tempM: MessageInterface = {
      role: m.role,
      content: newContent,
    }
    transformedMessages.push(tempM);
  });

  return transformedMessages
}

export const adjustConfigBasedOnMessages = (
  messages: MessageInterface[],
  config: ConfigInterface,
): ConfigInterface => {
  const adjustedConfig: ConfigInterface = {
    frequency_penalty: config.frequency_penalty,
    max_tokens: config.max_tokens,
    model: config.model,
    presence_penalty: config.presence_penalty,
    temperature: config.temperature,
    top_p: config.top_p,
  };

  const getMatch = (content: string, regex: RegExp) => {
    let result = regex.exec(content);
    if (!result || !result.groups)
      return;
    return result.groups.match;
  };

  messages.forEach((m) => {
    let result = getMatch(m.content, regexes.tokens)
    if (result) {
      adjustedConfig.max_tokens = +result
    }
    result = getMatch(m.content, regexes.temp)
    if (result) {
      adjustedConfig.temperature = +result
    }
    result = getMatch(m.content, regexes.topp)
    if (result) {
      adjustedConfig.top_p = +result
    }
    result = getMatch(m.content, regexes.presence)
    if (result) {
      adjustedConfig.presence_penalty = +result
    }
    result = getMatch(m.content, regexes.frequency)
    if (result) {
      adjustedConfig.frequency_penalty = +result
    }
  });

  return adjustedConfig
}