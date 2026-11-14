import type { ErrorCode } from '../../shared/protocol';
import type { TranslationKey } from '../i18n/translations';

/** Map server error codes to translated toast messages. */
export const errorCodeToastKey: Record<ErrorCode, TranslationKey> = {
  generation_failed: 'generationFailed',
  invalid_message: 'invalidMessage',
  invalid_phase: 'invalidPhase',
  judge_pending: 'judgePending',
  judgement_failed: 'judgementFailed',
  name_taken: 'nameTaken',
  not_host: 'notHost',
  not_your_turn: 'notYourTurn',
  room_not_found: 'roomNotFound',
};
