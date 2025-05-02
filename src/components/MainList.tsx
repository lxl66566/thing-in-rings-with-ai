import { createSignal, For, Component, Setter, Accessor } from "solid-js";
import { TableItem, VennArea } from "../types/game";
import { judgeItemPlacement } from "../llm";
import { toast } from "solid-toast";
import { useLanguage } from "../i18n/LanguageContext";
import { ColorPicker } from "./common/ColorPicker";

const toEmoji = (value: boolean) => {
  return value ? "✅" : "❌";
};

interface MainListProps {
  items: Accessor<TableItem[]>;
  setItems: Setter<TableItem[]>;
  isStarting: Accessor<boolean>;
}

const MainList: Component<MainListProps> = (props) => {
  const { t, language } = useLanguage();
  const [name, setName] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [word, setWord] = createSignal(false);
  const [attribute, setAttribute] = createSignal(false);
  const [context, setContext] = createSignal(false);

  const [isLoading, setIsLoading] = createSignal(false); // 用于表示加载状态

  // fake data
  // const l = [];
  // for (let i = 0; i < 20; i++) {
  //   l.push({
  //     id: i,
  //     name: " 123",
  //     description: " 456",
  //     userInput: {
  //       word: false,
  //       attribute: false,
  //       context: false,
  //     },
  //     actualResult: {
  //       word: false,
  //       attribute: false,
  //       context: false,
  //     },
  //     explanation: "123",
  //   });
  // }
  // setItems(l);

  const resetUserInput = () => {
    // 可选：创建成功后清空输入框
    setName("");
    setDescription("");
    setWord(false);
    setAttribute(false);
    setContext(false);
  };

  // 处理"创建"按钮点击事件的异步函数
  const handleCreate = async () => {
    if (!name()) {
      toast.error(t("noNameSelected"));
      return;
    }
    setIsLoading(true);

    const userInputArea: VennArea = {
      word: word(),
      attribute: attribute(),
      context: context(),
    };

    const userInputItem = {
      word: name(),
      description: description(),
    };

    try {
      const judgementResult = await judgeItemPlacement(language, userInputItem, userInputArea);
      const actualResult = judgementResult?.isCorrect ? userInputArea : judgementResult?.correctJudgement;

      if (!actualResult) {
        toast.error("Incorrect judgement");
        return;
      }

      const newItem: TableItem = {
        id: Date.now(),
        name: name(),
        description: description(),
        color: "#FFFFFF", // 默认颜色
        userInput: userInputArea,
        actualResult: actualResult,
        explanation: judgementResult?.explanation || t("noExplanation"),
      };
      props.setItems((prev) => [...prev, newItem]);
    } catch (error) {
      console.error("Error creating item:", error);
      toast.error(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
      resetUserInput();
    }
  };

  const updateItemColor = (itemId: number, newColor: string) => {
    props.setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, color: newColor } : item)));
  };

  return (
    <div class="p-6 h-full">
      {/* <h1 class="text-2xl font-bold mb-6 text-gray-800">Venn Area Creator</h1> */}

      {/* 输入行 */}
      <div class="flex w-auto flex-row flex-wrap md:flex-nowrap items-start sm:items-center mb-8 space-y-4 sm:space-y-0 sm:space-x-6 p-4 sm:p-6 bg-white rounded-lg shadow sticky top-5 z-10">
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
        <div class="flex flex-row flex-nowrap w-auto items-center space-y-2 sm:space-y-0 sm:space-x-4 pt-2 sm:pt-0">
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
          onClick={handleCreate}
          disabled={isLoading() || props.isStarting()}
          class="w-[calc(100%-2rem)] min-w-10 sm:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading() ? t("llmGenerating") : t("create")}
        </button>
      </div>

      {/* 表格区域 */}
      <div class="flex items-center gap-2 mb-4">
        <h2 class="text-xl font-bold text-gray-800">{t("ItemsList")}</h2>
        <span class="text-sm text-gray-600">{t("ItemsListDescription")}</span>
      </div>

      <div class="w-full overflow-x-auto bg-white rounded-lg shadow-md">
        <table class="w-auto min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" class="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" class="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-yellow-500 uppercase tracking-wider">
                Word
              </th>
              <th scope="col" class="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                Attribute
              </th>
              <th scope="col" class="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">
                Context
              </th>
              <th scope="col" class="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Explanation
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <For each={props.items()}>
              {(item) => (
                <tr>
                  <td class="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-800 flex items-center">
                    <div class="flex items-center gap-0.5 flex-nowrap">
                      <span class="flex-shrink-0 pr-2">{item.name}</span>
                      <ColorPicker selectedColor={item.color || "#FFFFFF"} onColorSelect={(color) => updateItemColor(item.id, color)} />
                    </div>
                  </td>
                  <td class="px-2 sm:px-6 py-2 sm:py-4 whitespace-normal break-words text-sm text-gray-800">{item.description}</td>
                  <td
                    class="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm font-medium"
                    classList={{
                      "bg-red-100 text-red-800": item.userInput.word !== item.actualResult.word,
                      "bg-green-100 text-green-800": item.userInput.word === item.actualResult.word,
                    }}
                  >
                    {toEmoji(item.actualResult.word)}
                  </td>
                  <td
                    class="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm font-medium"
                    classList={{
                      "bg-red-100 text-red-800": item.userInput.attribute !== item.actualResult.attribute,
                      "bg-green-100 text-green-800": item.userInput.attribute === item.actualResult.attribute,
                    }}
                  >
                    {toEmoji(item.actualResult.attribute)}
                  </td>
                  <td
                    class="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm font-medium"
                    classList={{
                      "bg-red-100 text-red-800": item.userInput.context !== item.actualResult.context,
                      "bg-green-100 text-green-800": item.userInput.context === item.actualResult.context,
                    }}
                  >
                    {toEmoji(item.actualResult.context)}
                  </td>
                  <td class="px-2 sm:px-6 py-2 sm:py-4 whitespace-normal break-words text-sm text-gray-800">
                    <details>
                      <summary>{t("expandExplanation")}</summary>
                      {item.explanation}
                    </details>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { MainList };
