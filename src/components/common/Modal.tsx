import type { Component, JSX } from "solid-js";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: JSX.Element;
  title: string;
}

export const Modal: Component<ModalProps> = (props) => {
  return (
    <div class={`fixed inset-0 z-50 ${props.isOpen ? "block" : "hidden"}`} onClick={props.onClose}>
      {/* 背景遮罩 */}
      <div class="absolute inset-0 bg-black opacity-50"></div>

      {/* Modal 内容 */}
      <div class="relative min-h-screen flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          {/* 标题栏 */}
          <div class="flex items-center justify-between p-4 border-b">
            <h3 class="text-xl font-semibold">{props.title}</h3>
            <button onClick={props.onClose} class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 内容区域 */}
          <div class="p-4">{props.children}</div>
        </div>
      </div>
    </div>
  );
};
