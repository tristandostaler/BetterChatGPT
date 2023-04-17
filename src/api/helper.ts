import { EventSourceData } from '@type/api';
import { ConfigInterface, MessageInterface } from '@type/chat';

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
    var newContent = m.content;
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