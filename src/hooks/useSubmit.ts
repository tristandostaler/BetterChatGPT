import React from 'react';
import useStore from '@store/store';
import { useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { ChatInterface, ConfigInterface, MessageInterface, ModelOptions } from '@type/chat';
import { getChatCompletion, getChatCompletionStream } from '@api/api';
import { parseEventSource } from '@api/helper';
import { limitMessageTokens } from '@utils/messageUtils';
import { _defaultChatConfig, minResponseSize } from '@constants/chat';
import { officialAPIEndpoint } from '@constants/auth';
import { executeFunction, functionsSchemaTokens } from '@api/functions';
import { ZodError } from 'zod';
import { AppwriteException } from 'appwrite';

// Determine whether commas should be ignored as sentence separators
var CN_IGNORE_COMMAS = true;
// Settings for the text-to-speech functionality (the bot's voice)
var CN_TEXT_TO_SPEECH_RATE = 2; // The higher the rate, the faster the bot will speak
var CN_TEXT_TO_SPEECH_PITCH = 1; // This will alter the pitch for the bot's voice

// Split the text into sentences so the speech synthesis can start speaking as soon as possible
function CN_SplitIntoSentences(text: string) {
  var sentences = [];
  var currentSentence = "";

  for (var i = 0; i < text.length; i++) {
    //
    var currentChar = text[i];

    // Add character to current sentence
    currentSentence += currentChar;

    // is the current character a delimiter? if so, add current part to array and clear
    if (
      // Latin punctuation
      currentChar == (CN_IGNORE_COMMAS ? '.' : ',')
      || currentChar == (CN_IGNORE_COMMAS ? '.' : ':')
      || currentChar == '.'
      || currentChar == '!'
      || currentChar == '?'
      || currentChar == (CN_IGNORE_COMMAS ? '.' : ';')
      || currentChar == '…'
      // Chinese/japanese punctuation
      || currentChar == (CN_IGNORE_COMMAS ? '.' : '、')
      || currentChar == (CN_IGNORE_COMMAS ? '.' : '，')
      || currentChar == '。'
      || currentChar == '．'
      || currentChar == '！'
      || currentChar == '？'
      || currentChar == (CN_IGNORE_COMMAS ? '.' : '；')
      || currentChar == (CN_IGNORE_COMMAS ? '.' : '：')
    ) {
      if (currentSentence.trim() != "") sentences.push(currentSentence.trim());
      currentSentence = "";
    }
  }

  return { 'sentences': sentences, 'remainder': currentSentence };
}

const useSubmit = () => {
  const { t, i18n } = useTranslation('api');
  const error = useStore((state) => state.error);
  const setError = useStore((state) => state.setError);
  const apiEndpoint = useStore((state) => state.apiEndpoint);
  const apiKey = useStore((state) => state.apiKey);
  const setGenerating = useStore((state) => state.setGenerating);
  const generating = useStore((state) => state.generating);
  const currentChatIndex = useStore((state) => state.currentChatIndex);
  const setChats = useStore((state) => state.setChats);
  const enableSpeech = useStore((state) => state.textToSpeech);

  var textToReadCache = '';
  var sentences = [''];
  var needSetGeneratingFalse = false;
  var speechInitialized = false;
  var read = () => {}
  try {
  var msg = new SpeechSynthesisUtterance();
  msg.rate = CN_TEXT_TO_SPEECH_RATE;
  msg.pitch = CN_TEXT_TO_SPEECH_PITCH;
  // msg.lang = document.documentElement.lang;

  read = () => {
    // window.speechSynthesis.pause()
    // window.speechSynthesis.resume()
    if (!window.speechSynthesis.speaking && sentences.length > 0) {
      var s = sentences.shift();
      if (!s) return;
      // console.log('reading sentence: ' + s);
      msg.text = s;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(msg);
    } else if (!window.speechSynthesis.speaking && sentences.length == 0) {
      if (textToReadCache != '') {
        // console.log('reading remiainder: ' + textToReadCache);
        sentences.push(textToReadCache);
        textToReadCache = '';
        read();
      } else {
        if (needSetGeneratingFalse) {
          setGenerating(false);
        }
      }
    }
  }

  msg.onend = () => {
    if (useStore.getState().generating && (sentences.length > 0 || textToReadCache != '')) read();
    else if (useStore.getState().generating && needSetGeneratingFalse) setGenerating(false);
    else if (!useStore.getState().generating) window.speechSynthesis.cancel();
  }
  speechInitialized = true;
  } catch(error) {}
  
  const speechHandler = (text: string) => {
    if (!enableSpeech || !speechInitialized) return;
    textToReadCache += text;
    var res = CN_SplitIntoSentences(textToReadCache);
    var s = res['sentences'];
    var r = res['remainder'];
    if (s != null) {
      sentences = sentences.concat(s);
      textToReadCache = r;
    }
    // console.log('Sentences: ' + sentences)
    // console.log('textToReadCache: ' + textToReadCache)
    read();
  }

  const generateTitle = async (
    message: MessageInterface[],
    max_tokens: number,
    model: ModelOptions,
  ): Promise<string> => {
    let data;
    const adjustedConfig: ConfigInterface = {
      frequency_penalty: _defaultChatConfig.frequency_penalty,
      max_tokens: max_tokens,
      model: model,
      presence_penalty: _defaultChatConfig.presence_penalty,
      temperature: _defaultChatConfig.temperature,
      top_p: _defaultChatConfig.top_p,
    };

    if (!apiKey || apiKey.length === 0) {
      // official endpoint
      if (apiEndpoint === officialAPIEndpoint) {
        throw new Error(t('noApiKeyWarning') as string);
      }

      // other endpoints
      data = await getChatCompletion(
        useStore.getState().apiEndpoint,
        message,
        adjustedConfig
      );
    } else if (apiKey) {
      // own apikey
      data = await getChatCompletion(
        useStore.getState().apiEndpoint,
        message,
        adjustedConfig,
        apiKey
      );
    }
    return data.choices[0].message.content;
  };

  const getChatCompletionWithFunctionResult = async (config: ConfigInterface, messages: MessageInterface[], fnName: string, fnArgs: any, result: any, user_message: string) => {
    var newMessages = messages.concat([
      { locked: true, role: "assistant", content: "", function_call: { name: fnName, arguments: fnArgs } },
    ]);

    var resultText = result + ""

    var substring_size = resultText.length;
    var round = 0;
    var totalTokens = -1;
    do {
      substring_size = substring_size - (round * 10)
      var tmp = resultText.substring(0, substring_size);
      if (tmp === "") {
        throw new Error("Max tokens reached. Please use a model with more tokens available.");
      }
      const adjustedMessagesTuple = limitMessageTokens(
        newMessages.concat([{ locked: true, role: "function", name: fnName, content: tmp }, { role: "user", "content": user_message }]),
        config.max_tokens - functionsSchemaTokens(config.model),
        config.model
      );
      totalTokens = config.max_tokens - adjustedMessagesTuple[1] - functionsSchemaTokens(config.model);
      round++
    } while (totalTokens < minResponseSize)

    resultText = resultText.substring(0, substring_size);

    newMessages.push({ locked: true, role: "function", name: fnName, content: resultText })

    if (user_message != "") {
      newMessages.push({ locked: true, role: "user", "content": user_message })
    }
    return await getChatCompletion(
      useStore.getState().apiEndpoint,
      newMessages,
      config,
      apiKey
    );
  }

  async function handlerFunctionCallResult(config: ConfigInterface, retry_count: number, fnName: string, fnArgs: any, messages: MessageInterface[], funcResult: any, result: any): Promise<any> {
    if (retry_count < -1) throw new Error("An error occured while handling function call. Max retry count reached. Latest result: " + result);

    if (funcResult.choices[0].finish_reason === "function_call") {
      return await handleFunctionCall(config, retry_count, funcResult.choices[0].message.function_call.name, funcResult.choices[0].message.function_call.arguments, messages);
    } else if ((funcResult.choices[0].message.content as string).includes("RETRY")) {
      let funcResult = await getChatCompletionWithFunctionResult(config, messages, fnName, fnArgs, result, `If you made an error, retry now. You have ${retry_count} try left.`);
      return await handlerFunctionCallResult(config, retry_count - 1, fnName, fnArgs, messages, funcResult, result);
    } else if ((funcResult.choices[0].message.content as string).includes("WORKED")) {
      let funcResult = await getChatCompletionWithFunctionResult(config, messages, fnName, fnArgs, result, ``);
      return funcResult.choices[0].message.content
    }
    throw new Error("An error occured calling the function. Latest content retrived: " + funcResult.choices[0].message.content);
  }

  const handleFunctionCall = async (config: ConfigInterface, retry_count: number, fnName: string, fnArgs: any, messages: MessageInterface[]) => {
    if (!useStore.getState().generating) return

    if (retry_count < -1) throw new Error("An error occured while handling function call. Max retry count reached");

    var result = await executeFunction(apiKey ?? "", fnName, JSON.parse(fnArgs)).catch(error => error)

    if (result instanceof ZodError) {
      result = `Failed to execute script: ${result.message}`;
    } else if (result instanceof AppwriteException) {
      throw new Error(result.message);
    } else if (result instanceof Error) {
      if (retry_count == 0)
        throw new Error(result.message);
      result = result.message;
    }

    let funcResult = await getChatCompletionWithFunctionResult(config, messages, fnName, fnArgs, result, `If the previous function call worked, reply "WORKED". If not, reply "RETRY".`)
    return handlerFunctionCallResult(config, retry_count, fnName, fnArgs, messages, funcResult, result)

  }

  const handleSubmit = async () => {
    const chats = useStore.getState().chats;
    if (generating || !chats || window.speechSynthesis.speaking) return;

    needSetGeneratingFalse = false;
    textToReadCache = '';
    sentences = [''];

    const updatedChats: ChatInterface[] = JSON.parse(JSON.stringify(chats));

    updatedChats[currentChatIndex].messages.push({
      role: 'assistant',
      content: '',
      locked: false,
    });

    setChats(updatedChats);
    setGenerating(true);

    try {
      let stream;
      if (chats[currentChatIndex].messages.length === 0)
        throw new Error('No messages submitted!');

      // no api key (free)
      if (!apiKey || apiKey.length === 0) {
        // official endpoint
        if (apiEndpoint === officialAPIEndpoint) {
          throw new Error(t('noApiKeyWarning') as string);
        }

        // other endpoints
        stream = await getChatCompletionStream(
          useStore.getState().apiEndpoint,
          chats[currentChatIndex].messages,
          chats[currentChatIndex].config
        );
      } else if (apiKey) {
        // own apikey
        stream = await getChatCompletionStream(
          useStore.getState().apiEndpoint,
          chats[currentChatIndex].messages,
          chats[currentChatIndex].config,
          apiKey
        );
      }

      let fnName = '';
      let fnArgs = '';
      let isFunctionCall = false;

      if (stream) {
        if (stream.locked)
          throw new Error(
            'Oops, the stream is locked right now. Please try again'
          );
        const reader = stream.getReader();
        let reading = true;
        let partial = '';
        while (reading && useStore.getState().generating) {
          const { done, value } = await reader.read();
          const result = parseEventSource(
            partial + new TextDecoder().decode(value)
          );
          partial = '';

          if (result === '[DONE]' || done) {
            reading = false;
          } else {
            const resultString = result.reduce((output: string, curr) => {
              if (typeof curr === 'string') {
                partial += curr;
              } else {
                if (curr.choices[0].delta.function_call?.name) {
                  fnName += curr.choices[0].delta.function_call?.name;
                  if (!isFunctionCall) {
                    isFunctionCall = true;
                    output += "Plugin call requested. Loading..."
                  }
                }
                if (curr.choices[0].delta.function_call?.arguments) {
                  fnArgs += curr.choices[0].delta.function_call?.arguments;
                }
                const content = curr.choices[0].delta.content;
                if (content) output += content;
              }
              return output;
            }, '');

            const updatedChats: ChatInterface[] = JSON.parse(
              JSON.stringify(useStore.getState().chats)
            );
            const updatedMessages = updatedChats[currentChatIndex].messages;
            updatedMessages[updatedMessages.length - 1].content += resultString;
            setChats(updatedChats);
            speechHandler(resultString);
          }
        }
        if (!useStore.getState().generating) {
          reader.cancel('Cancelled by user');
          window.speechSynthesis.cancel();
        } else {
          reader.cancel('Generation completed');
        }
        reader.releaseLock();
        stream.cancel();
      }

      if (isFunctionCall) {
        var functionCallResult = await handleFunctionCall(chats[currentChatIndex].config, 5, fnName, fnArgs, chats[currentChatIndex].messages);
        if (useStore.getState().generating) {
          const updatedChats: ChatInterface[] = JSON.parse(
            JSON.stringify(useStore.getState().chats)
          );
          const updatedMessages = updatedChats[currentChatIndex].messages;
          updatedMessages[updatedMessages.length - 1].content = functionCallResult;
          setChats(updatedChats);
          speechHandler(functionCallResult);
        }
      }

      // generate title for new chats
      const currChats = useStore.getState().chats;
      if (
        useStore.getState().autoTitle &&
        currChats &&
        !currChats[currentChatIndex]?.titleSet
      ) {
        const messages_length = currChats[currentChatIndex].messages.length;
        const assistant_message =
          currChats[currentChatIndex].messages[messages_length - 1].content;
        const user_message =
          currChats[currentChatIndex].messages[messages_length - 2].content;

        const message: MessageInterface = {
          role: 'user',
          content: `Generate a title in less than 6 words for the following message (language: ${i18n.language}):\n"""\nUser: ${user_message}\nAssistant: ${assistant_message}\n"""`,
        };

        let title = (await generateTitle([message], chats[currentChatIndex].config.max_tokens, chats[currentChatIndex].config.model)).trim();
        if (title.startsWith('"') && title.endsWith('"')) {
          title = title.slice(1, -1);
        }
        const updatedChats: ChatInterface[] = JSON.parse(
          JSON.stringify(useStore.getState().chats)
        );
        updatedChats[currentChatIndex].title = title;
        updatedChats[currentChatIndex].titleSet = true;
        setChats(updatedChats);
      }
    } catch (e: unknown) {
      const err = (e as Error).message;
      console.log(err);
      setError(err);
    }

    if (window.speechSynthesis.speaking) {
      needSetGeneratingFalse = true;
    } else {
      setGenerating(false);
    }
  };

  return { handleSubmit, error };
};

export default useSubmit;
