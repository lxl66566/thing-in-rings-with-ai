import { For, type Component, type Setter, type Accessor } from 'solid-js';

import { useLanguage } from '../i18n/LanguageContext';
import type { TableItem } from '../types/game';
import { ColorPicker } from './common/ColorPicker';

const toEmoji = (value: boolean) => {
  return value ? '✅' : '❌';
};

interface MainListProps {
  isStarting: Accessor<boolean>;
  items: Accessor<TableItem[]>;
  setItems: Setter<TableItem[]>;
}

const MainList: Component<MainListProps> = props => {
  const { t } = useLanguage();

  const updateItemColor = (itemId: number, newColor: string) => {
    props.setItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, color: newColor } : item,
      ),
    );
  };

  return (
    <div class="flex flex-col gap-4 p-4 sm:p-6">
      {/* 表格区域 */}
      <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
        <h2 class="text-xl font-bold text-gray-800">{t('ItemsList')}</h2>
        <span class="text-sm text-gray-600">{t('ItemsListDescription')}</span>
      </div>

      <div class="w-full overflow-x-auto rounded-lg bg-white shadow-md">
        <table class="w-auto min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-2 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6 sm:py-3"
                scope="col"
              >
                Name
              </th>
              <th
                class="px-2 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6 sm:py-3"
                scope="col"
              >
                Description
              </th>
              <th
                class="px-2 py-2 text-left text-xs font-medium tracking-wider text-yellow-500 uppercase sm:px-6 sm:py-3"
                scope="col"
              >
                Word
              </th>
              <th
                class="px-2 py-2 text-left text-xs font-medium tracking-wider text-red-500 uppercase sm:px-6 sm:py-3"
                scope="col"
              >
                Attribute
              </th>
              <th
                class="px-2 py-2 text-left text-xs font-medium tracking-wider text-blue-500 uppercase sm:px-6 sm:py-3"
                scope="col"
              >
                Context
              </th>
              <th
                class="px-2 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6 sm:py-3"
                scope="col"
              >
                Explanation
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <For each={props.items()}>
              {item => (
                <tr>
                  <td class="flex items-center px-2 py-2 text-sm whitespace-nowrap text-gray-800 sm:px-6 sm:py-4">
                    <div class="flex flex-nowrap items-center gap-0.5">
                      <span class="flex-shrink-0 pr-2">{item.name}</span>
                      <ColorPicker
                        onColorSelect={color => {
                          updateItemColor(item.id, color);
                        }}
                        selectedColor={item.color ?? '#FFFFFF'}
                      />
                    </div>
                  </td>
                  <td class="max-w-40 px-2 py-2 text-sm break-words whitespace-normal text-gray-800 sm:max-w-none sm:px-6 sm:py-4">
                    {item.description}
                  </td>
                  <td
                    class="px-2 py-2 text-sm font-medium whitespace-nowrap sm:px-6 sm:py-4"
                    classList={{
                      'bg-green-100 text-green-800':
                        item.userInput.word === item.actualResult.word,
                      'bg-red-100 text-red-800':
                        item.userInput.word !== item.actualResult.word,
                    }}
                  >
                    {toEmoji(item.actualResult.word)}
                  </td>
                  <td
                    class="px-2 py-2 text-sm font-medium whitespace-nowrap sm:px-6 sm:py-4"
                    classList={{
                      'bg-green-100 text-green-800':
                        item.userInput.attribute ===
                        item.actualResult.attribute,
                      'bg-red-100 text-red-800':
                        item.userInput.attribute !==
                        item.actualResult.attribute,
                    }}
                  >
                    {toEmoji(item.actualResult.attribute)}
                  </td>
                  <td
                    class="px-2 py-2 text-sm font-medium whitespace-nowrap sm:px-6 sm:py-4"
                    classList={{
                      'bg-green-100 text-green-800':
                        item.userInput.context === item.actualResult.context,
                      'bg-red-100 text-red-800':
                        item.userInput.context !== item.actualResult.context,
                    }}
                  >
                    {toEmoji(item.actualResult.context)}
                  </td>
                  <td class="max-w-40 px-2 py-2 text-sm break-words whitespace-normal text-gray-800 sm:max-w-none sm:px-6 sm:py-4">
                    <details>
                      <summary>{t('expandExplanation')}</summary>
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
