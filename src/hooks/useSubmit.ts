import React from 'react';
import useStore from '@store/store';
import { useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { ChatInterface, MessageInterface } from '@type/chat';
import { getChatCompletion, getChatCompletionStream } from '@api/api';
import { parseEventSource } from '@api/helper';
import { limitMessageTokens } from '@utils/messageUtils';
import { _defaultChatConfig } from '@constants/chat';
import { officialAPIEndpoint } from '@constants/auth';

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
  const orgId = useStore((state) => state.orgId);
  const setGenerating = useStore((state) => state.setGenerating);
  const generating = useStore((state) => state.generating);
  const currentChatIndex = useStore((state) => state.currentChatIndex);
  const setChats = useStore((state) => state.setChats);
  const enableSpeech = useStore((state) => state.textToSpeech);

  var textToReadCache = '';
  var sentences = [''];
  var needSetGeneratingFalse = false;
  const msg = new SpeechSynthesisUtterance();
  msg.rate = CN_TEXT_TO_SPEECH_RATE;
  msg.pitch = CN_TEXT_TO_SPEECH_PITCH;
  // msg.lang = document.documentElement.lang;

  const read = () => {
    if (!window.speechSynthesis.speaking && sentences.length > 0) {
      var s = sentences.shift();
      if (!s) return;
      // console.log('reading sentence: ' + s);
      msg.text = s;
      window.speechSynthesis.speak(msg);
    } else if (!useStore.getState().generating) {
      if (!window.speechSynthesis.speaking && sentences.length == 0) {
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
  }

  msg.onend = () => {
    if (useStore.getState().generating && (sentences.length > 0 || textToReadCache != '')) read();
    else if (useStore.getState().generating && needSetGeneratingFalse) setGenerating(false);
    else if (!useStore.getState().generating) window.speechSynthesis.cancel();
  }

  const speechHandler = (text: string) => {
    if (!enableSpeech) return;
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
    message: MessageInterface[]
  ): Promise<string> => {
    let data;
    if (!apiKey || apiKey.length === 0) {
      // official endpoint
      if (apiEndpoint === officialAPIEndpoint) {
        throw new Error(t('noApiKeyWarning') as string);
      }

      // other endpoints
      data = await getChatCompletion(
        useStore.getState().apiEndpoint,
        message,
        _defaultChatConfig,
        orgId
      );
    } else if (apiKey) {
      // own apikey
      data = await getChatCompletion(
        useStore.getState().apiEndpoint,
        message,
        _defaultChatConfig,
        orgId,
        apiKey
      );
    }
    return data.choices[0].message.content;
  };

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
    });

    setChats(updatedChats);
    setGenerating(true);

    try {
      let stream;
      if (chats[currentChatIndex].messages.length === 0)
        throw new Error('No messages submitted!');

      const messages = limitMessageTokens(
        chats[currentChatIndex].messages,
        chats[currentChatIndex].config.max_tokens,
        chats[currentChatIndex].config.model
      );
      if (messages.length === 0) throw new Error('Message exceed max token!');

      // no api key (free)
      if (!apiKey || apiKey.length === 0) {
        // official endpoint
        if (apiEndpoint === officialAPIEndpoint) {
          throw new Error(t('noApiKeyWarning') as string);
        }

        // other endpoints
        stream = await getChatCompletionStream(
          useStore.getState().apiEndpoint,
          messages,
          chats[currentChatIndex].config,
          orgId
        );
      } else if (apiKey) {
        // own apikey
        stream = await getChatCompletionStream(
          useStore.getState().apiEndpoint,
          messages,
          chats[currentChatIndex].config,
          orgId,
          apiKey
        );
      }

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

        let title = (await generateTitle([message])).trim();
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
