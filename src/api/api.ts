import { ShareGPTSubmitBodyInterface } from '@type/api';
import { ConfigInterface, MessageInterface } from '@type/chat';
import { isAzureEndpoint } from '@utils/api';
import { adjustConfigAndRemoveConfigContentInMessages } from './helper';
import { limitMessageTokens } from '@utils/messageUtils';
import { functionsSchemas, functionsSchemaTokens } from './functions'
import { minResponseSize } from '@constants/chat';


async function prepareStreamAndGetResponse(customHeaders: Record<string, string> | undefined, messagesToSend: MessageInterface[], config: ConfigInterface, apiKey: string | undefined, endpoint: string, stream: boolean) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  var minResponseLength = 1;

  const tempConfig = adjustConfigAndRemoveConfigContentInMessages(messagesToSend, config);
  if (tempConfig.max_tokens > minResponseSize + 100) {
    minResponseLength = minResponseSize;
  }
  var functionsSchemaTokenLength = functionsSchemaTokens(tempConfig.model);
  tempConfig.max_tokens -= functionsSchemaTokenLength;

  const adjustedMessagesTuple = limitMessageTokens(
    messagesToSend,
    config.max_tokens,
    tempConfig.model,
    minResponseLength
  );
  const messages = adjustedMessagesTuple[0];
  tempConfig.max_tokens -= adjustedMessagesTuple[1];
  if (messages.length <= 0 || tempConfig.max_tokens < minResponseLength) throw new Error('Message exceed max token! Minimum needed ' + (Math.abs(adjustedMessagesTuple[1]) + functionsSchemaTokenLength + minResponseLength));

  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  if (isAzureEndpoint(endpoint) && apiKey) headers['api-key'] = apiKey;
  if (config.orgId && config.orgId != '') {
    if (config.orgId.indexOf(" - ") == -1) {
      headers['OpenAI-Organization'] = config.orgId;
    }
    else {
      var orgIdToUse = config.orgId.match(".*? - \\(([A-Za-z0-9\\-]+)\\)");
      if (orgIdToUse) {
        headers['OpenAI-Organization'] = orgIdToUse[1];
      }
    }
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      messages,
      ...tempConfig,
      max_tokens: undefined,
      stream: stream,
      functions: functionsSchemas
    }),
  });
  return response;
}

export const getChatCompletion = async (
  endpoint: string,
  messagesToSend: MessageInterface[],
  config: ConfigInterface,
  apiKey?: string,
  customHeaders?: Record<string, string>
) => {
  const response = await prepareStreamAndGetResponse(customHeaders, messagesToSend, config, apiKey, endpoint, false);
  if (!response.ok) throw new Error(await response.text());

  const data = await response.json();
  return data;
};

export const getChatCompletionStream = async (
  endpoint: string,
  messagesToSend: MessageInterface[],
  config: ConfigInterface,
  apiKey?: string,
  customHeaders?: Record<string, string>
) => {
  const response = await prepareStreamAndGetResponse(customHeaders, messagesToSend, config, apiKey, endpoint, true);
  if (response.status === 404 || response.status === 405) {
    const text = await response.text();
    if (text.includes('model_not_found')) {
      throw new Error(
        text +
        '\nMessage from Better ChatGPT:\nPlease ensure that you have access to the GPT-4 API!'
      );
    } else {
      throw new Error(
        'Message from Better ChatGPT:\nInvalid API endpoint! We recommend you to check your free API endpoint.'
      );
    }
  }

  if (response.status === 429 || !response.ok) {
    const text = await response.text();
    let error = text;
    if (text.includes('insufficient_quota')) {
      error +=
        '\nMessage from Better ChatGPT:\nWe recommend changing your API endpoint or API key';
    } else if (response.status === 429) {
      error += '\nRate limited!';
    }
    throw new Error(error);
  }

  const stream = response.body;
  return stream;
};

export const submitShareGPT = async (body: ShareGPTSubmitBodyInterface) => {
  const request = await fetch('https://sharegpt.com/api/conversations', {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  const response = await request.json();
  const { id } = response;
  const url = `https://shareg.pt/${id}`;
  window.open(url, '_blank');
};


