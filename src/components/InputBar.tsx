import { type Accessor, type Component, createSignal } from "solid-js";
import { useLanguage } from "../i18n/LanguageContext";
import type { VennArea } from "../types/game";
import toast from "solid-toast";

interface InputBarProps {
  onCreate: (name: string, description: string, area: VennArea, callback: () => void) => void;
  disableButton?: Accessor<boolean>;
}

const InputBar: Component<InputBarProps> = (props) => {
  const { t } = useLanguage();
  const [name, setName] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [word, setWord] = createSignal(false);
  const [attribute, setAttribute] = createSignal(false);
  const [context, setContext] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false); // 用于表示加载状态

  const resetUserInput = () => {
    // 可选：创建成功后清空输入框
    setName("");
    setDescription("");
    setWord(false);
    setAttribute(false);
    setContext(false);
  };

  return (
    <div class="flex w-auto sticky top-5 z-10 flex-row flex-wrap md:flex-nowrap items-start sm:items-center mb-8 space-y-4 sm:space-y-0 sm:space-x-6 p-4 sm:p-6 bg-white rounded-lg shadow">
      {/* Name 输入框 */}
      <div class="w-[calc(100%-2rem)] sm:w-auto">
        <input
          id="name"
          type="text"
          value={name()}
          placeholder={t("word")}
          onInput={(e) => setName(e.currentTarget.value)}
          class="p-2 border border-gray-300 rounded-md w-full sm:min-w-25 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Description 输入框 */}
      <div class="w-[calc(100%-2rem)] sm:w-auto sm:flex-1">
        <input
          id="description"
          type="text"
          value={description()}
          onInput={(e) => setDescription(e.currentTarget.value)}
          placeholder={t("description")}
          class="p-2 border border-gray-300 rounded-md w-full sm:min-w-25 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Checkboxes 容器 */}
      <div class="flex flex-row flex-nowrap gap-3 w-auto items-center pt-2">
        {/* Word Checkbox */}
        <label class="flex items-center cursor-pointer text-gray-700">
          <input
            type="checkbox"
            checked={word()}
            onChange={(e) => setWord(e.currentTarget.checked)}
            class="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <span class="ml-2 text-sm text-yellow-500">Word</span>
        </label>

        {/* Attribute Checkbox */}
        <label class="flex items-center cursor-pointer text-gray-700">
          <input
            type="checkbox"
            checked={attribute()}
            onChange={(e) => setAttribute(e.currentTarget.checked)}
            class="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <span class="ml-2 text-sm text-red-500">Attribute</span>
        </label>

        {/* Context Checkbox */}
        <label class="flex items-center cursor-pointer text-gray-700">
          <input
            type="checkbox"
            checked={context()}
            onChange={(e) => setContext(e.currentTarget.checked)}
            class="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <span class="ml-2 text-sm text-blue-500">Context</span>
        </label>
      </div>

      {/* 创建按钮 */}
      <button
        onClick={() => {
          if (!name()) {
            toast.error(t("noNameSelected"));
            return;
          }
          setIsLoading(true);
          props.onCreate(name(), description(), { word: word(), attribute: attribute(), context: context() }, () => {
            resetUserInput();
            setIsLoading(false);
          });
        }}
        disabled={isLoading() || (props.disableButton ? props.disableButton() : false)}
        class="w-[calc(100%-2rem)] min-w-10 sm:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading() ? t("llmGenerating") : t("create")}
      </button>
    </div>
  );
};

export default InputBar;
