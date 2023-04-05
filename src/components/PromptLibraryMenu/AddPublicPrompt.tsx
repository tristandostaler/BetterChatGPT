import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import useStore from '@store/store';

import { importPromptCSV } from '@utils/prompt';

const AddPublicPrompt = () => {
  const { t } = useTranslation();

  const inputRef = useRef<HTMLInputElement>(null);
  const [alert, setAlert] = useState<{
    message: string;
    success: boolean;
  } | null>(null);

  const handlePromptSync = () => {
    // if (!inputRef || !inputRef.current) return;
    // const file = inputRef.current.files?.[0];
    // if (file) {
    //   const reader = new FileReader();

    //   reader.onload = (event) => {
    //     const csvString = event.target?.result as string;

    //     try {
    //       const results = importPromptCSV(csvString);

    //       const prompts = useStore.getState().prompts;
    //       const setPrompts = useStore.getState().setPrompts;

    //       const newPrompts = results.map((data) => {
    //         const columns = Object.values(data);
    //         return {
    //           id: uuidv4(),
    //           private: true,
    //           name: columns[0],
    //           prompt: columns[1],
    //         };
    //       });

    //       setPrompts(prompts.concat(newPrompts));

    //       setAlert({ message: 'Succesfully imported!', success: true });
    //     } catch (error: unknown) {
    //       setAlert({ message: (error as Error).message, success: false });
    //     }
    //   };

    //   reader.readAsText(file);
    // }
  };

  return (
    <div>
      <label className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300'>
        Add public prompts sync
      </label>
      <input
        className='text-gray-800 dark:text-white p-3 text-sm border-none bg-gray-200 dark:bg-gray-600 rounded-md m-0 w-full mr-0 h-8 focus:outline-none'
        type='text'
        ref={inputRef}
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
