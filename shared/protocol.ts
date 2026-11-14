import * as v from 'valibot';

/**
 * Wire protocol shared by the multiplayer server (server/) and the browser
 * client (src/). Schemas are valibot so both ends validate untrusted input;
 * message types form discriminated unions on `type` for exhaustive switches.
 */

export const vennAreaSchema = v.object({
  attribute: v.boolean(),
  context: v.boolean(),
  word: v.boolean(),
});
export type VennArea = v.InferOutput<typeof vennAreaSchema>;

export const areaAttributesSchema = v.object({
  attribute: v.string(),
  context: v.string(),
  word: v.string(),
});
export type AreaAttributes = v.InferOutput<typeof areaAttributesSchema>;

/** Lifecycle phase of a room. */
export const roomPhaseSchema = v.picklist(['lobby', 'generating', 'playing']);
export type RoomPhase = v.InferOutput<typeof roomPhaseSchema>;

/** Machine-readable rejection reasons; clients translate them via i18n. */
export const errorCodeSchema = v.picklist([
  'generation_failed',
  'invalid_message',
  'invalid_phase',
  'judge_pending',
  'judgement_failed',
  'name_taken',
  'not_host',
  'not_your_turn',
  'room_not_found',
]);
export type ErrorCode = v.InferOutput<typeof errorCodeSchema>;

export const roomMemberSchema = v.object({
  color: v.string(),
  connected: v.boolean(),
  id: v.string(),
  isHost: v.boolean(),
  name: v.string(),
});
export type RoomMember = v.InferOutput<typeof roomMemberSchema>;

/** One row of the shared items table; pending until the host judged it. */
export const roomEntrySchema = v.object({
  actual: v.optional(vennAreaSchema),
  description: v.string(),
  explanation: v.optional(v.string()),
  guesses: vennAreaSchema,
  id: v.number(),
  pending: v.boolean(),
  playerId: v.string(),
  playerName: v.string(),
  word: v.string(),
});
export type RoomEntry = v.InferOutput<typeof roomEntrySchema>;

/** Full authoritative room state, broadcast to every member on each change. */
export const roomSnapshotSchema = v.object({
  attributes: v.optional(areaAttributesSchema),
  code: v.string(),
  currentTurnPlayerId: v.optional(v.string()),
  entries: v.array(roomEntrySchema),
  hostId: v.string(),
  members: v.array(roomMemberSchema),
  phase: roomPhaseSchema,
});
export type RoomSnapshot = v.InferOutput<typeof roomSnapshotSchema>;

/** Client -> server. */
export const clientMessageSchema = v.variant('type', [
  v.object({
    name: v.pipe(v.string(), v.minLength(1), v.maxLength(24)),
    type: v.literal('create_room'),
  }),
  v.object({
    code: v.pipe(v.string(), v.minLength(4), v.maxLength(4)),
    name: v.pipe(v.string(), v.minLength(1), v.maxLength(24)),
    type: v.literal('join_room'),
  }),
  v.object({ type: v.literal('start_game') }),
  v.object({ type: v.literal('restart_game') }),
  v.object({ type: v.literal('skip_player') }),
  v.object({
    description: v.pipe(v.string(), v.maxLength(200)),
    guesses: vennAreaSchema,
    type: v.literal('submit_item'),
    word: v.pipe(v.string(), v.minLength(1), v.maxLength(64)),
  }),
  v.object({
    actual: vennAreaSchema,
    entryId: v.number(),
    explanation: v.string(),
    type: v.literal('judgement_result'),
  }),
  v.object({
    entryId: v.number(),
    message: v.string(),
    type: v.literal('judgement_failed'),
  }),
  v.object({
    attributes: areaAttributesSchema,
    type: v.literal('generation_result'),
  }),
  v.object({
    message: v.string(),
    type: v.literal('generation_failed'),
  }),
]);
export type ClientMessage = v.InferOutput<typeof clientMessageSchema>;

/** Server -> client. `youId` tells the receiving socket which member it is. */
export const serverMessageSchema = v.variant('type', [
  v.object({
    snapshot: roomSnapshotSchema,
    type: v.literal('room_state'),
    youId: v.string(),
  }),
  v.object({
    reason: v.literal('host_left'),
    type: v.literal('room_closed'),
  }),
  v.object({ code: errorCodeSchema, type: v.literal('error') }),
]);
export type ServerMessage = v.InferOutput<typeof serverMessageSchema>;
