import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@store/store';
import Toggle from '@components/Toggle';

const TextToSpeechToggle = () => {
  const { t } = useTranslation();

  const setTextToSpeech = useStore((state) => state.setTextToSpeech);

  const [isChecked, setIsChecked] = useState<boolean>(
    useStore.getState().textToSpeech
  );

  useEffect(() => {
    setTextToSpeech(isChecked);
  }, [isChecked]);

  return (
    <Toggle
      label="Text to speech"
      isChecked={isChecked}
      setIsChecked={setIsChecked}
    />
  );
};

export default TextToSpeechToggle;
