import { Component, createSignal, Show } from "solid-js";
import { Portal } from "solid-js/web";

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

/**
 * 颜色选择器组件
 * 点击按钮后在鼠标位置显示颜色选择面板
 */
export const ColorPicker: Component<ColorPickerProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [position, setPosition] = createSignal({ x: 0, y: 0 });

  // 预定义的颜色选项
  const colors = ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#00FFFF", "#0000FF", "#8B00FF", "#FF69B4", "#000000", "#808080", "#FFFFFF", "#8B4513"];

  // 处理按钮点击，显示颜色选择面板
  const handleClick = (e: MouseEvent) => {
    setPosition({
      x: e.clientX,
      y: e.clientY,
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
      <button onClick={handleClick} class="w-6 h-6 rounded border border-gray-300 focus:outline-none" style={{ "background-color": props.selectedColor }} />

      <Show when={isOpen()}>
        <Portal>
          <div
            class="fixed z-50 bg-white rounded-lg shadow-lg p-2"
            style={{
              left: `${position().x}px`,
              top: `${position().y}px`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div class="grid grid-cols-4 gap-1">
              {colors.map((color) => (
                <button class="w-6 h-6 rounded hover:scale-110 transition-transform" style={{ "background-color": color }} onClick={() => selectColor(color)} />
              ))}
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  );
};
