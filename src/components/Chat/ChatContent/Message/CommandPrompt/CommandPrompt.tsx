import React, { useEffect, useRef, useState } from 'react';
import useStore from '@store/store';
import { useTranslation } from 'react-i18next';
import { matchSorter } from 'match-sorter';
import { Prompt } from '@type/prompt';
import { HelperPrompt } from '@constants/prompt';

const CommandPrompt = ({
  _setContent,
  _setDropDownCallbackFunctionBuilder,
  _setInputCallbackFunctionBuilder,
}: {
  _setContent: React.Dispatch<React.SetStateAction<string>>;
  _setDropDownCallbackFunctionBuilder: Function;
  _setInputCallbackFunctionBuilder: Function;
}) => {
  const { t } = useTranslation();
  const getPrompts = () => {
    return useStore.getState().prompts.concat(HelperPrompt);
  }
  const [dropDown, setDropDown] = useState<boolean>(false);
  const [dropDownLocal, setDropDownLocal] = useState<boolean>(false);
  const [_prompts, _setPrompts] = useState<Prompt[]>(getPrompts());
  const [input, setInput] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  _setDropDownCallbackFunctionBuilder((d: boolean) => { setDropDown(d); setSelectedIndex(-1); setSelectedId(''); })
  _setInputCallbackFunctionBuilder((s: string) => {
    if (s === 'ArrowUp' || s === 'ArrowDown' || s === 'Enter' || s === 'Escape') {
      // console.log(s)
      searchInputRef.current?.dispatchEvent(new KeyboardEvent('keydown', {
        key: s,
        bubbles: true,
        cancelable: true,
        view: window,
      }))
    } else {
      const filteredPrompts = matchSorter(getPrompts(), s, {
        keys: ['name'],
      });

      if (filteredPrompts.length > 0) {
        setInput(s);
      } else {
        setInput('');
        setDropDown(false);
      }
    }
  })

  useEffect(() => {
    if (dropDown) {
      searchInputRef.current?.focus();
    }
  }, [dropDownLocal])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropDown(false);
      }
    };

    if (dropDown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef, dropDown]);

  useEffect(() => {
    const filteredPrompts = matchSorter(getPrompts(), input, {
      keys: ['name'],
    });
    _setPrompts(filteredPrompts);
  }, [input]);

  useEffect(() => {
    _setPrompts(getPrompts());
    setInput('');
  }, [useStore(store => store.prompts)]);

  return (
    <div className='absolute top-[-30px] right-0' ref={dropdownRef}>
      <button
        className='btn btn-neutral btn-small'
        onClick={() => { setDropDown(!dropDown); setDropDownLocal(!dropDown); }}
      >
        /
      </button>
      <div
        className={`${dropDown ? '' : 'hidden'
          } absolute top-100 bottom-100 right-0 z-10 bg-white rounded-lg shadow-xl border-b border-black/10 dark:border-gray-900/50 text-gray-800 dark:text-gray-100 group dark:bg-gray-900 opacity-90`}
        style={{
          bottom: 'calc(100% + 5px)',
          width: '30rem',
          maxWidth: '90dvw',
        }}
      >
        <div className='text-sm px-4 py-2'>{t('promptLibrary')} - You can use Arrows and Enter</div>
        <input
          ref={searchInputRef}
          type='text'
          className='text-gray-800 dark:text-white p-3 text-sm border-none bg-gray-200 dark:bg-gray-900 m-0 mr-0 h-8 focus:outline-none'
          value={input}
          placeholder={t('search') as string}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setDropDown(!dropDown); setDropDownLocal(!dropDown);
            }
            else if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
              e.preventDefault();
              var childs = e.currentTarget.parentElement?.children;
              if (!childs) {
                return
              }
              if (childs.length < 3) {
                return
              }
              childs = childs[2].children;
              var toSelect = selectedIndex;
              if (e.key == 'ArrowDown') {
                toSelect = selectedIndex + 1;
                if (toSelect >= childs.length) {
                  toSelect = 0;
                }
              } else if (e.key == 'ArrowUp') {
                toSelect = selectedIndex - 1;
                if (toSelect == -1) {
                  toSelect = childs.length - 1;
                }
              } else if (e.key == 'Enter') {
                var c = childs[toSelect];
                if (!c) {
                  return;
                }
                c.dispatchEvent(new MouseEvent('click', {
                  view: window,
                  bubbles: true,
                  cancelable: true,
                  buttons: 1,
                }))
                return;
              }

              var c = childs[toSelect];
              if (!c) {
                return;
              }
              setSelectedIndex(toSelect);
              setSelectedId(c.id);
              c.scrollIntoView({
                behavior: 'auto',
                block: 'nearest'
              });
            }
          }}
        />
        <ul className='text-sm text-gray-700 dark:text-gray-200 p-0 m-0 max-h-32 overflow-auto'>
          {_prompts.map((cp) => (
            <li
              tabIndex={0}
              style={selectedId == cp.id ? {
                backgroundColor: 'rgb(75 85 99 / var(--tw-bg-opacity))',
                color: 'white',
              } : {}}
              className='px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer text-start w-full'
              onClick={() => {
                _setContent((prev) => cp.prompt);
                setDropDown(false);
              }}
              onFocus={() => {
                setSelectedId(cp.id);
              }}
              id={cp.id}
              key={cp.id}
            >
              {cp.name}
            </li>
          ))}
        </ul>
      </div>
    </div >
  );
};

export default CommandPrompt;
