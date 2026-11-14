import { type Accessor, type Component, createSignal } from 'solid-js';
import toast from 'solid-toast';

import { useLanguage } from '../i18n/LanguageContext';
import type { VennArea } from '../types/game';

interface InputBarProps {
  disableButton?: Accessor<boolean>;
  onCreate: (
    name: string,
    description: string,
    area: VennArea,
    callback: () => void,
  ) => void;
}

const InputBar: Component<InputBarProps> = props => {
  const { t } = useLanguage();
  const [name, setName] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [word, setWord] = createSignal(false);
  const [attribute, setAttribute] = createSignal(false);
  const [context, setContext] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false); // 用于表示加载状态

  const resetUserInput = () => {
    // 可选：创建成功后清空输入框
    setName('');
    setDescription('');
    setWord(false);
    setAttribute(false);
    setContext(false);
  };

  return (
    <div class="sticky top-5 z-10 mb-8 flex w-auto flex-row flex-wrap items-start space-y-4 rounded-lg bg-white p-4 shadow sm:items-center sm:space-y-0 sm:space-x-6 sm:p-6 md:flex-nowrap">
      {/* Name 输入框 */}
      <div class="w-[calc(100%-2rem)] sm:w-auto">
        <input
          class="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:min-w-25"
          id="name"
          onInput={e => setName(e.currentTarget.value)}
          placeholder={t('word')}
          type="text"
          value={name()}
        />
      </div>

      {/* Description 输入框 */}
      <div class="w-[calc(100%-2rem)] sm:w-auto sm:flex-1">
        <input
          class="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:min-w-25"
          id="description"
          onInput={e => setDescription(e.currentTarget.value)}
          placeholder={t('description')}
          type="text"
          value={description()}
        />
      </div>

      {/* Checkboxes 容器 */}
      <div class="flex w-auto flex-row flex-nowrap items-center gap-3 pt-2">
        {/* Word Checkbox */}
        <label class="flex cursor-pointer items-center text-gray-700">
          <input
            checked={word()}
            class="form-checkbox h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
            onChange={e => setWord(e.currentTarget.checked)}
            type="checkbox"
          />
          <span class="ml-2 text-sm text-yellow-500">Word</span>
        </label>

        {/* Attribute Checkbox */}
        <label class="flex cursor-pointer items-center text-gray-700">
          <input
            checked={attribute()}
            class="form-checkbox h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
            onChange={e => setAttribute(e.currentTarget.checked)}
            type="checkbox"
          />
          <span class="ml-2 text-sm text-red-500">Attribute</span>
        </label>

        {/* Context Checkbox */}
        <label class="flex cursor-pointer items-center text-gray-700">
          <input
            checked={context()}
            class="form-checkbox h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
            onChange={e => setContext(e.currentTarget.checked)}
            type="checkbox"
          />
          <span class="ml-2 text-sm text-blue-500">Context</span>
        </label>
      </div>

      {/* 创建按钮 */}
      <button
        class="focus:ring-opacity-50 w-[calc(100%-2rem)] min-w-10 rounded-md bg-blue-600 px-6 py-2 font-semibold text-white shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        disabled={
          isLoading() || (props.disableButton ? props.disableButton() : false)
        }
        onClick={() => {
          if (!name()) {
            toast.error(t('noNameSelected'));
            return;
          }
          setIsLoading(true);
          props.onCreate(
            name(),
            description(),
            { attribute: attribute(), context: context(), word: word() },
            () => {
              resetUserInput();
              setIsLoading(false);
            },
          );
        }}
      >
        {isLoading() ? t('llmGenerating') : t('create')}
      </button>
    </div>
  );
};

export default InputBar;
