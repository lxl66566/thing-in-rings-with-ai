import { type Component, createSignal, Show, For } from 'solid-js';
import { Portal } from 'solid-js/web';

import { PLAYER_COLORS } from '../../../shared/colors';

interface ColorPickerProps {
  onColorSelect: (color: string) => void;
  selectedColor: string;
}

/**
 * 颜色选择器组件
 * 点击按钮后在鼠标位置显示颜色选择面板
 */
export const ColorPicker: Component<ColorPickerProps> = props => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [position, setPosition] = createSignal({ x: 0, y: 0 });

  // 预定义的颜色选项（与联机昵称共用一套色板）
  const colors = PLAYER_COLORS;

  // 处理按钮点击，显示颜色选择面板（位置夹取到视口内，避免移动端贴边时面板超出屏幕）
  const handleClick = (e: MouseEvent) => {
    const halfPanel = 64;
    const panelHeight = 120;
    setPosition({
      x: Math.min(
        Math.max(e.clientX, halfPanel),
        window.innerWidth - halfPanel,
      ),
      y: Math.max(e.clientY, panelHeight),
    });
    setIsOpen(!isOpen());
  };

  // 选择颜色
  const selectColor = (color: string) => {
    props.onColorSelect(color);
    setIsOpen(false);
  };

  return (
    <div class="relative flex items-center">
      <button
        class="h-6 w-6 rounded border border-gray-300 focus:outline-none"
        onClick={handleClick}
        style={{ 'background-color': props.selectedColor }}
      />

      <Show when={isOpen()}>
        <Portal>
          <div
            class="fixed z-50 rounded-lg bg-white p-2 shadow-lg"
            style={{
              left: `${String(position().x)}px`,
              top: `${String(position().y)}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div class="grid grid-cols-4 gap-1">
              <For each={colors}>
                {(color: string) => (
                  <button
                    class="h-6 w-6 rounded transition-transform hover:scale-110"
                    onClick={() => {
                      selectColor(color);
                    }}
                    style={{ 'background-color': color }}
                  />
                )}
              </For>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  );
};
