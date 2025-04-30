import { createSignal, For, Component } from "solid-js";
import { VennArea } from "../types/game";
import { judgeItemPlacement } from "../llm";
import { toast } from "solid-toast";
import { useLanguage } from "../i18n/LanguageContext";

// 定义表格中每个条目的类型
// 包含用户输入的值和异步函数返回的实际值
type TableItem = {
  id: number; // 用于列表渲染的唯一key
  name: string;
  description: string;
  userInput: VennArea; // 用户输入时的VennArea值
  actualResult: VennArea; // 异步函数返回的实际VennArea值
};

const MainList: Component = () => {
  const { t } = useLanguage();
  const [name, setName] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [word, setWord] = createSignal(false);
  const [attribute, setAttribute] = createSignal(false);
  const [context, setContext] = createSignal(false);

  const [items, setItems] = createSignal<TableItem[]>([]); // 存储表格数据的数组信号
  const [isLoading, setIsLoading] = createSignal(false); // 用于表示加载状态

  // 处理“创建”按钮点击事件的异步函数
  const handleCreate = async () => {
    if (!name()) {
      toast.error(t("noNameSelected"));
      return;
    }
    if (!word() && !attribute() && !context()) {
      toast.error(t("noAttributesSelected"));
      return;
    }
    setIsLoading(true); // 开始加载

    // 获取当前用户输入值
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
      // 调用模拟的异步创建函数
      const judgementResult = await judgeItemPlacement(userInputItem, userInputArea);
      const actualResult = judgementResult?.isCorrect ? userInputArea : judgementResult?.correctJudgement;
      console.log(actualResult);
      if (!actualResult) {
        toast.error("Incorrect judgement");
        return;
      }

      // 创建新的表格条目对象
      const newItem: TableItem = {
        id: Date.now(), // 使用时间戳作为唯一ID
        name: name(),
        description: description(),
        userInput: userInputArea, // 存储用户输入时的值
        actualResult: actualResult, // 存储实际返回的值
      };

      // 更新表格数据状态
      setItems((prev) => [...prev, newItem]);

      // 可选：创建成功后清空输入框
      setName("");
      setDescription("");
      setWord(false);
      setAttribute(false);
      setContext(false);
    } catch (error) {
      console.error("Error creating item:", error);
      // 处理错误，例如显示错误消息给用户
    } finally {
      setIsLoading(false); // 结束加载
    }
  };

  return (
    <div class="p-6 h-full">
      {/* <h1 class="text-2xl font-bold mb-6 text-gray-800">Venn Area Creator</h1> */}

      {/* 输入行 */}
      <div class="flex flex-col sm:flex-row items-start sm:items-center mb-8 space-y-4 sm:space-y-0 sm:space-x-6 p-4 bg-white rounded-lg shadow-md">
        {/* Name 输入框 */}
        <div>
          <input
            id="name"
            type="text"
            value={name()}
            placeholder={t("word")}
            onInput={(e) => setName(e.currentTarget.value)}
            class="p-2 border border-gray-300 rounded-md w-full sm:w-30 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Description 输入框 */}
        <div class="flex-1">
          <input
            id="description"
            type="text"
            value={description()}
            onInput={(e) => setDescription(e.currentTarget.value)}
            placeholder={t("description")}
            class="p-2 border border-gray-300 rounded-md sm:flex-1 w-full sm:w-36 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Checkboxes 容器 */}
        <div class="flex items-center space-x-4 pt-2 sm:pt-0">
          {/* Word Checkbox */}
          <label class="flex items-center cursor-pointer text-gray-700">
            <input
              type="checkbox"
              checked={word()}
              onChange={(e) => setWord(e.currentTarget.checked)}
              class="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span class="ml-2 text-sm">Word</span>
          </label>

          {/* Attribute Checkbox */}
          <label class="flex items-center cursor-pointer text-gray-700">
            <input
              type="checkbox"
              checked={attribute()}
              onChange={(e) => setAttribute(e.currentTarget.checked)}
              class="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span class="ml-2 text-sm">Attribute</span>
          </label>

          {/* Context Checkbox */}
          <label class="flex items-center cursor-pointer text-gray-700">
            <input
              type="checkbox"
              checked={context()}
              onChange={(e) => setContext(e.currentTarget.checked)}
              class="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span class="ml-2 text-sm">Context</span>
          </label>
        </div>

        {/* 创建按钮 */}
        <button
          onClick={handleCreate}
          disabled={isLoading()} // 加载时禁用按钮
          class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading() ? "Creating..." : "Create"}
        </button>
      </div>

      {/* 表格区域 */}
      <h2 class="text-xl font-bold mb-4 text-gray-800">{t("ItemsList")}</h2>
      {items().length === 0 ? (
        <p class="text-gray-600">{t("noItemsAdded")}</p>
      ) : (
        <div class="overflow-x-auto bg-white rounded-lg shadow-md">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Word (Actual Value)
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attribute (Actual Value)
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Context (Actual Value)
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {/* 使用 SolidJS 的 For 指令渲染列表 */}
              <For each={items()}>
                {(item) => (
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.description}</td>

                    {/* Word 列，根据用户输入与实际值对比标红或标绿 */}
                    <td
                      class="px-6 py-4 whitespace-nowrap text-sm font-medium"
                      classList={{
                        "bg-red-100 text-red-800": item.userInput.word !== item.actualResult.word,
                        "bg-green-100 text-green-800": item.userInput.word === item.actualResult.word,
                      }}
                    >
                      {item.actualResult.word.toString()} {/* 显示实际值 */}
                    </td>

                    {/* Attribute 列 */}
                    <td
                      class="px-6 py-4 whitespace-nowrap text-sm font-medium"
                      classList={{
                        "bg-red-100 text-red-800": item.userInput.attribute !== item.actualResult.attribute,
                        "bg-green-100 text-green-800": item.userInput.attribute === item.actualResult.attribute,
                      }}
                    >
                      {item.actualResult.attribute.toString()} {/* 显示实际值 */}
                    </td>

                    {/* Context 列 */}
                    <td
                      class="px-6 py-4 whitespace-nowrap text-sm font-medium"
                      classList={{
                        "bg-red-100 text-red-800": item.userInput.context !== item.actualResult.context,
                        "bg-green-100 text-green-800": item.userInput.context === item.actualResult.context,
                      }}
                    >
                      {item.actualResult.context.toString()} {/* 显示实际值 */}
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export { MainList };
