import { Show, type Component } from 'solid-js';

import type { AreaAttributes } from '../../shared/protocol';
import { useLanguage } from '../i18n/LanguageContext';
import { Modal } from './common/Modal';

interface GeneratedAttributesModalProps {
  attributes?: AreaAttributes;
  isOpen: boolean;
  onClose: () => void;
}

/** Modal listing the three LLM-generated zone attributes. */
export const GeneratedAttributesModal: Component<
  GeneratedAttributesModalProps
> = props => {
  const { t } = useLanguage();

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      title={t('generatedAttributes')}
    >
      <Show when={props.attributes}>
        {attributes => (
          <ul>
            <li class="text-red-500">
              <strong>Attribute</strong>: {attributes().attribute}
            </li>
            <li class="text-blue-500">
              <strong>Context</strong>: {attributes().context}
            </li>
            <li class="text-yellow-500">
              <strong>Word</strong>: {attributes().word}
            </li>
          </ul>
        )}
      </Show>
    </Modal>
  );
};
