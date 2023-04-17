import { modelOptions } from '@constants/chat';
import { EventSourceData } from '@type/api';
import { ConfigInterface, MessageInterface } from '@type/chat';

const regex = /(?:~ Max Tokens: (?<tokens>[0-9]+) ~)?(?:~ Temperature: (?<temp>[0-9\.]+) ~)?(?:~ Top-p: (?<topp>[0-9\.]+) ~)?(?:~ Presence Penalty: (?<presence>[0-9\.]+) ~)?(?:~ Frequency Penalty: (?<frequency>[0-9\.]+) ~)?/;

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
  }

  messages.forEach((m) => {
    var newContent = m.content.replace(regex, '');
    for (let [key, value] of Object.entries(replacements)) {
      newContent = newContent.replaceAll('{{' + key + '}}', value);
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

  messages.forEach((m) => {
    let result = regex.exec(m.content);
    if (!result || !result.groups)
      return;
    if (result.groups.tokens) {
      adjustedConfig.max_tokens = +result.groups.tokens
    }
    if (result.groups.temp) {
      adjustedConfig.temperature = +result.groups.temp
    }
    if (result.groups.topp) {
      adjustedConfig.top_p = +result.groups.topp
    }
    if (result.groups.presence) {
      adjustedConfig.presence_penalty = +result.groups.presence
    }
    if (result.groups.frequency) {
      adjustedConfig.frequency_penalty = +result.groups.frequency
    }
  });

  return adjustedConfig
}