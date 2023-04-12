import useSyncPrompt from '@hooks/PublicPrompts/useSyncPrompt';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const AddPublicPrompt = () => {
  const { t } = useTranslation();

  const syncPrompt = useSyncPrompt();
  const inputNameRef = useRef<HTMLInputElement>(null);
  const inputSourceRef = useRef<HTMLInputElement>(null);
  const [alert, setAlert] = useState<{
    message: string;
    success: boolean;
  } | null>(null);

  const handlePromptSync = () => {
    if (!inputNameRef || !inputSourceRef || (!inputNameRef.current && !inputSourceRef.current)) return;

    if (!inputNameRef.current || inputNameRef.current.value == "" || !inputSourceRef.current || inputSourceRef.current.value == "") {
      setAlert({ message: 'Please set both the name and the URL values', success: false });
      return;
    }

    syncPrompt(inputSourceRef.current.value, inputNameRef.current.value, true).then(r => {
      setAlert({ message: r.message, success: r.isSuccess });
    });

  }

  return (
    <div>
      <label className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300'>
        Add public prompts sync
      </label>
      <label className='block text-sm font-medium text-gray-900 dark:text-gray-300'>
        Name:
      </label>
      <input
        className='text-gray-800 mb-2 dark:text-white p-3 text-sm border-none bg-gray-200 dark:bg-gray-600 rounded-md m-0 w-full mr-0 h-8 focus:outline-none'
        type='text'
        ref={inputNameRef}
      />
      <label className='block text-sm font-medium text-gray-900 dark:text-gray-300'>
        Url:
      </label>
      <input
        className='text-gray-800 dark:text-white p-3 text-sm border-none bg-gray-200 dark:bg-gray-600 rounded-md m-0 w-full mr-0 h-8 focus:outline-none'
        type='text'
        ref={inputSourceRef}
      />
      <button
        className='btn btn-small btn-primary mt-3'
        onClick={handlePromptSync}
      >
        Add
      </button>
      {alert && (
        <div
          className={`relative py-2 px-3 w-full mt-3 border rounded-md text-gray-600 dark:text-gray-100 text-sm whitespace-pre-wrap ${alert.success
            ? 'border-green-500 bg-green-500/10'
            : 'border-red-500 bg-red-500/10'
            }`}
        >
          {alert.message}
        </div>
      )}
    </div>
  );
};

export default AddPublicPrompt;
