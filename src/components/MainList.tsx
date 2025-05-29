import { For, type Component, type Setter, type Accessor } from "solid-js";
import type { TableItem } from "../types/game";
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
  const { t } = useLanguage();

  const updateItemColor = (itemId: number, newColor: string) => {
    props.setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, color: newColor } : item)));
  };

  return (
    <div class="p-6 min-h-screen h-full overflow-visible">
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
