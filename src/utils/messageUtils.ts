import { MessageInterface, ModelOptions } from '@type/chat';

import { Tiktoken } from '@dqbd/tiktoken/lite';
import { replaceDynamicContentInMessages } from '@api/helper';
import { minResponseSize } from '@constants/chat';
const cl100k_base = await import('@dqbd/tiktoken/encoders/cl100k_base.json');

export const encoder = new Tiktoken(
  cl100k_base.bpe_ranks,
  {
    ...cl100k_base.special_tokens,
    '<|im_start|>': 100264,
    '<|im_end|>': 100265,
    '<|im_sep|>': 100266,
  },
  cl100k_base.pat_str
);

// https://github.com/dqbd/tiktoken/issues/23#issuecomment-1483317174
export const getChatGPTEncoding = (
  messages: MessageInterface[],
  model: ModelOptions
) => {
  const isGpt3 = model.startsWith('gpt-3.5-turbo');

  const msgSep = isGpt3 ? '\n' : '';
  const roleSep = isGpt3 ? '\n' : '<|im_sep|>';

  const m = replaceDynamicContentInMessages(messages, model);

  const serialized = [
    m
      .map(({ role, content, function_call, name }) => {
        return `<|im_start|>${role}${roleSep}${content}${JSON.stringify(function_call)}${name}<|im_end|>`;
      })
      .join(msgSep),
    `<|im_start|>assistant${roleSep}`,
  ].join(msgSep);

  return encoder.encode(serialized, 'all');
};

const countTokens = (messages: MessageInterface[], model: ModelOptions) => {
  if (messages.length === 0) return 0;
  return getChatGPTEncoding(messages, model).length;
};

export const limitMessageTokens = (
  messagesToSend: MessageInterface[],
  limit: number = 4096,
  model: ModelOptions,
  minResponseLength: number = minResponseSize,
): [MessageInterface[], number] => {

  const messages = replaceDynamicContentInMessages(messagesToSend, model);

  const limitedMessages: MessageInterface[] = [];
  let tokenCount = 0;

  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].locked || i == messages.length - 1) {
      const count = countTokens([messages[i]], model);
      tokenCount += count;
    }
  }

  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].locked || i == messages.length - 1) {
      limitedMessages.unshift({ ...{ role: messages[i].role, content: messages[i].content, function_call: messages[i].function_call, name: messages[i].name } });
      continue;
    }
    const count = countTokens([messages[i]], model);
    if (tokenCount + count + minResponseLength > limit) { continue; }
    tokenCount += count;
    limitedMessages.unshift({ ...{ role: messages[i].role, content: messages[i].content, function_call: messages[i].function_call, name: messages[i].name } });
  }

  return [limitedMessages, tokenCount];
};

export default countTokens;
