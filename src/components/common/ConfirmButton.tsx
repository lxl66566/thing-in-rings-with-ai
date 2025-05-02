import { Component, createSignal } from "solid-js";
import { Modal } from "./Modal";
import { useLanguage } from "../../i18n/LanguageContext";

interface ConfirmButtonProps {
  /** 按钮显示的文本 */
  children: string;
  /** 确认对话框的标题 */
  confirmTitle?: string;
  /** 确认对话框的内容 */
  confirmContent?: string;
  /** 确认按钮的文本 */
  confirmButtonText?: string;
  /** 取消按钮的文本 */
  cancelButtonText?: string;
  /** 点击确认后的回调函数 */
  onConfirm: () => void;
  /** 按钮的类名 */
  className?: string;
  /** 按钮是否禁用 */
  disabled?: boolean;
}

export const ConfirmButton: Component<ConfirmButtonProps> = (props) => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = createSignal(false);

  const handleConfirm = () => {
    setIsModalOpen(false);
    props.onConfirm();
  };

  return (
    <>
      <button
        class={`px-4 py-2 rounded-lg transition-colors ${props.disabled ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"} ${
          props.className || ""
        }`}
        onClick={() => setIsModalOpen(true)}
        disabled={props.disabled}
      >
        {props.children}
      </button>

      <Modal isOpen={isModalOpen()} onClose={() => setIsModalOpen(false)} title={props.confirmTitle || t("confirm")}>
        <div class="space-y-4">
          <p class="text-gray-600">{props.confirmContent || t("confirmdo")}</p>
          <div class="flex justify-end space-x-3">
            <button class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors" onClick={() => setIsModalOpen(false)}>
              {props.cancelButtonText || t("cancel")}
            </button>
            <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" onClick={handleConfirm}>
              {props.confirmButtonText || t("confirm")}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
