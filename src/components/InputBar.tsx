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
    <div class="sticky top-2 z-10 flex flex-col gap-3 rounded-lg bg-white p-4 shadow sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-3 sm:p-6">
      {/* Name 输入框 */}
      <div class="w-full sm:w-auto">
        <input
          class="w-full rounded-md border border-gray-300 p-2.5 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:w-36"
          id="name"
          onInput={e => setName(e.currentTarget.value)}
          placeholder={t('word')}
          type="text"
          value={name()}
        />
      </div>

      {/* Description 输入框 */}
      <div class="w-full sm:flex-1">
        <input
          class="w-full rounded-md border border-gray-300 p-2.5 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:min-w-25"
          id="description"
          onInput={e => setDescription(e.currentTarget.value)}
          placeholder={t('description')}
          type="text"
          value={description()}
        />
      </div>

      {/* Checkboxes 容器 */}
      <div class="flex flex-nowrap items-center gap-3">
        {/* Word Checkbox */}
        <label class="flex cursor-pointer items-center py-1 text-gray-700">
          <input
            checked={word()}
            class="h-5 w-5 accent-blue-600"
            onChange={e => setWord(e.currentTarget.checked)}
            type="checkbox"
          />
          <span class="ml-2 text-sm text-yellow-500">Word</span>
        </label>

        {/* Attribute Checkbox */}
        <label class="flex cursor-pointer items-center py-1 text-gray-700">
          <input
            checked={attribute()}
            class="h-5 w-5 accent-blue-600"
            onChange={e => setAttribute(e.currentTarget.checked)}
            type="checkbox"
          />
          <span class="ml-2 text-sm text-red-500">Attribute</span>
        </label>

        {/* Context Checkbox */}
        <label class="flex cursor-pointer items-center py-1 text-gray-700">
          <input
            checked={context()}
            class="h-5 w-5 accent-blue-600"
            onChange={e => setContext(e.currentTarget.checked)}
            type="checkbox"
          />
          <span class="ml-2 text-sm text-blue-500">Context</span>
        </label>
      </div>

      {/* 创建按钮 */}
      <button
        class="w-full rounded-md bg-blue-600 px-6 py-2.5 font-semibold text-white shadow transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2"
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
