import type { Component, JSX } from 'solid-js';

interface ModalProps {
  children: JSX.Element;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export const Modal: Component<ModalProps> = props => {
  return (
    <div
      class={`fixed inset-0 z-50 overflow-y-auto ${props.isOpen ? 'block' : 'hidden'}`}
      onClick={() => {
        props.onClose();
      }}
    >
      {/* Modal 内容（遮罩放在内部，保证随内容滚动时始终覆盖全屏） */}
      <div class="relative flex min-h-full items-center justify-center p-4">
        <div class="absolute inset-0 bg-black opacity-50" />

        <div
          class="relative w-full max-w-md rounded-lg bg-white shadow-xl"
          onClick={e => {
            e.stopPropagation();
          }}
        >
          {/* 标题栏 */}
          <div class="flex items-center justify-between border-b p-4">
            <h3 class="text-xl font-semibold">{props.title}</h3>
            <button
              class="p-1 text-gray-400 transition-colors hover:text-gray-600"
              onClick={() => {
                props.onClose();
              }}
            >
              <svg
                class="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
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
