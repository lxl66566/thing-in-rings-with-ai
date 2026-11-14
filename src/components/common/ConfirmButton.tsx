import { type Component, createSignal } from 'solid-js';

import { useLanguage } from '../../i18n/LanguageContext';
import { Modal } from './Modal';

interface ConfirmButtonProps {
  /** 取消按钮的文本 */
  cancelButtonText?: string;
  /** 按钮显示的文本 */
  children: string;
  /** 按钮的类名 */
  className?: string;
  /** 确认按钮的文本 */
  confirmButtonText?: string;
  /** 确认对话框的内容 */
  confirmContent?: string;
  /** 确认对话框的标题 */
  confirmTitle?: string;
  /** 按钮是否禁用 */
  disabled?: boolean;
  /** 点击确认后的回调函数 */
  onConfirm: () => void;
}

export const ConfirmButton: Component<ConfirmButtonProps> = props => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = createSignal(false);

  const handleConfirm = () => {
    setIsModalOpen(false);
    props.onConfirm();
  };

  return (
    <>
      <button
        class={`rounded-lg px-4 py-2 transition-colors ${props.disabled ? 'cursor-not-allowed bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'} ${
          props.className ?? ''
        }`}
        disabled={props.disabled}
        onClick={() => setIsModalOpen(true)}
      >
        {props.children}
      </button>

      <Modal
        isOpen={isModalOpen()}
        onClose={() => setIsModalOpen(false)}
        title={props.confirmTitle ?? t('confirm')}
      >
        <div class="space-y-4">
          <p class="text-gray-600">{props.confirmContent ?? t('confirmdo')}</p>
          <div class="flex justify-end space-x-3">
            <button
              class="px-4 py-2 text-gray-600 transition-colors hover:text-gray-800"
              onClick={() => setIsModalOpen(false)}
            >
              {props.cancelButtonText ?? t('cancel')}
            </button>
            <button
              class="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
              onClick={handleConfirm}
            >
              {props.confirmButtonText ?? t('confirm')}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
