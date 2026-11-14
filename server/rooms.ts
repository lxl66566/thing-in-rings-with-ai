import { randomInt, randomUUID } from 'node:crypto';

import * as v from 'valibot';

import { PLAYER_COLORS } from '../shared/colors.ts';
import {
  type AreaAttributes,
  clientMessageSchema,
  type ClientMessage,
  type ErrorCode,
  type RoomEntry,
  type RoomPhase,
  type RoomSnapshot,
  type ServerMessage,
  type VennArea,
} from '../shared/protocol.ts';

/**
 * Transport-agnostic connection handle handed to the room manager by the
 * server entrypoint. Keeps room state independent of the `ws` library.
 */
export interface Connection {
  close: () => void;
  isAlive: boolean;
  markAlive: () => void;
  ping: () => void;
  send: (message: ServerMessage) => void;
}

interface ConnectionBinding {
  player: RoomPlayer;
  room: Room;
}

interface Room {
  attributes?: AreaAttributes;
  code: string;
  currentTurnPlayerId?: string;
  entries: RoomEntry[];
  entrySeq: number;
  hostId: string;
  phase: RoomPhase;
  players: RoomPlayer[];
}

interface RoomPlayer {
  color: string;
  conn?: Connection;
  connected: boolean;
  id: string;
  isHost: boolean;
  name: string;
}

/** Room codes avoid I/L/O/0/1 so they survive being read aloud or copied. */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 4;

export interface RoomManager {
  readonly connections: ReadonlySet<Connection>;
  handleConnect: (conn: Connection) => void;
  handleDisconnect: (conn: Connection) => void;
  handleMessage: (conn: Connection, raw: string) => void;
}

export function createRoomManager(): RoomManager {
  const rooms = new Map<string, Room>();
  const connections = new Set<Connection>();
  const bindings = new Map<Connection, ConnectionBinding>();

  const sendError = (conn: Connection, code: ErrorCode): void => {
    conn.send({ code, type: 'error' });
  };

  const snapshotOf = (room: Room): RoomSnapshot => ({
    attributes: room.attributes,
    code: room.code,
    currentTurnPlayerId: room.currentTurnPlayerId,
    entries: room.entries,
    hostId: room.hostId,
    members: room.players.map(player => ({
      color: player.color,
      connected: player.connected,
      id: player.id,
      isHost: player.isHost,
      name: player.name,
    })),
    phase: room.phase,
  });

  const broadcast = (room: Room): void => {
    for (const player of room.players) {
      if (player.connected && player.conn) {
        player.conn.send({
          snapshot: snapshotOf(room),
          type: 'room_state',
          youId: player.id,
        });
      }
    }
  };

  const dissolve = (room: Room): void => {
    rooms.delete(room.code);
    for (const player of room.players) {
      if (player.conn) {
        player.conn.send({ reason: 'host_left', type: 'room_closed' });
        player.conn.close();
        bindings.delete(player.conn);
      }
    }
    console.log(`[room ${room.code}] dissolved (host left)`);
  };

  /** Move the turn to the next connected player in join order. */
  const advanceTurn = (room: Room): void => {
    const currentIndex = room.currentTurnPlayerId
      ? room.players.findIndex(player => player.id === room.currentTurnPlayerId)
      : -1;
    for (let step = 1; step <= room.players.length; step += 1) {
      const candidate =
        room.players[(currentIndex + step) % room.players.length];
      if (candidate?.connected) {
        room.currentTurnPlayerId = candidate.id;
        return;
      }
    }
  };

  const pickColor = (usedColors: ReadonlySet<string>): string => {
    return PLAYER_COLORS.find(color => !usedColors.has(color)) ?? '#808080';
  };

  const generateCode = (): string => {
    for (let attempt = 0; attempt < 50; attempt += 1) {
      let code = '';
      for (let index = 0; index < CODE_LENGTH; index += 1) {
        code += CODE_ALPHABET.charAt(randomInt(CODE_ALPHABET.length));
      }
      if (!rooms.has(code)) return code;
    }
    throw new Error('could not generate a unique room code');
  };

  const createRoom = (conn: Connection, name: string): void => {
    const code = generateCode();
    const host: RoomPlayer = {
      color: pickColor(new Set()),
      conn,
      connected: true,
      id: randomUUID(),
      isHost: true,
      name,
    };
    const room: Room = {
      code,
      entries: [],
      entrySeq: 0,
      hostId: host.id,
      phase: 'lobby',
      players: [host],
    };
    rooms.set(code, room);
    bindings.set(conn, { player: host, room });
    console.log(`[room ${code}] created by ${name}`);
    broadcast(room);
  };

  const joinRoom = (conn: Connection, code: string, name: string): void => {
    const room = rooms.get(code);
    if (!room) {
      sendError(conn, 'room_not_found');
      return;
    }
    const existing = room.players.find(player => player.name === name);
    if (existing?.connected) {
      sendError(conn, 'name_taken');
      return;
    }
    if (existing) {
      // Seat reuse: a returning (offline) player keeps color and turn order.
      existing.connected = true;
      existing.conn = conn;
      bindings.set(conn, { player: existing, room });
      console.log(`[room ${code}] ${name} rejoined`);
    } else {
      const player: RoomPlayer = {
        color: pickColor(new Set(room.players.map(entry => entry.color))),
        conn,
        connected: true,
        id: randomUUID(),
        isHost: false,
        name,
      };
      room.players.push(player);
      bindings.set(conn, { player, room });
      console.log(`[room ${code}] ${name} joined`);
    }
    broadcast(room);
  };

  const submitItem = (
    conn: Connection,
    room: Room,
    player: RoomPlayer,
    word: string,
    description: string,
    guesses: VennArea,
  ): void => {
    if (room.phase !== 'playing') {
      sendError(conn, 'invalid_phase');
      return;
    }
    if (room.currentTurnPlayerId !== player.id) {
      sendError(conn, 'not_your_turn');
      return;
    }
    if (room.entries.some(entry => entry.pending)) {
      sendError(conn, 'judge_pending');
      return;
    }
    room.entries.push({
      description,
      guesses,
      id: room.entrySeq,
      pending: true,
      playerId: player.id,
      playerName: player.name,
      word,
    });
    room.entrySeq += 1;
    broadcast(room);
  };

  const resolveJudgement = (
    conn: Connection,
    room: Room,
    entryId: number,
    actual: VennArea,
    explanation: string,
  ): void => {
    const entry = room.entries.find(candidate => candidate.id === entryId);
    if (!entry?.pending) {
      sendError(conn, 'invalid_message');
      return;
    }
    entry.actual = actual;
    entry.explanation = explanation;
    entry.pending = false;
    advanceTurn(room);
    broadcast(room);
  };

  const failJudgement = (room: Room, entryId: number): void => {
    // Drop the unresolved entry; the submitting player keeps the turn.
    const index = room.entries.findIndex(
      candidate => candidate.id === entryId && candidate.pending,
    );
    if (index === -1) return;
    room.entries.splice(index, 1);
    console.log(
      `[room ${room.code}] judgement failed for entry ${String(entryId)}`,
    );
    broadcast(room);
  };

  const dispatch = (conn: Connection, message: ClientMessage): void => {
    const binding = bindings.get(conn);
    switch (message.type) {
      case 'create_room': {
        if (binding) {
          sendError(conn, 'invalid_phase');
          return;
        }
        createRoom(conn, message.name);
        return;
      }
      case 'generation_failed': {
        if (!binding?.player.isHost) {
          sendError(conn, 'not_host');
          return;
        }
        if (binding.room.phase !== 'generating') {
          sendError(conn, 'invalid_phase');
          return;
        }
        binding.room.phase = 'lobby';
        broadcast(binding.room);
        for (const player of binding.room.players) {
          if (player.connected && player.conn) {
            sendError(player.conn, 'generation_failed');
          }
        }
        return;
      }
      case 'generation_result': {
        if (!binding?.player.isHost) {
          sendError(conn, 'not_host');
          return;
        }
        if (binding.room.phase !== 'generating') {
          sendError(conn, 'invalid_phase');
          return;
        }
        const room = binding.room;
        room.attributes = message.attributes;
        room.entries = [];
        room.phase = 'playing';
        advanceTurn(room);
        broadcast(room);
        return;
      }
      case 'join_room': {
        if (binding) {
          sendError(conn, 'invalid_phase');
          return;
        }
        joinRoom(conn, message.code, message.name);
        return;
      }
      case 'judgement_failed': {
        if (!binding?.player.isHost) {
          sendError(conn, 'not_host');
          return;
        }
        failJudgement(binding.room, message.entryId);
        return;
      }
      case 'judgement_result': {
        if (!binding?.player.isHost) {
          sendError(conn, 'not_host');
          return;
        }
        resolveJudgement(
          conn,
          binding.room,
          message.entryId,
          message.actual,
          message.explanation,
        );
        return;
      }
      case 'restart_game': {
        if (!binding?.player.isHost) {
          sendError(conn, 'not_host');
          return;
        }
        if (binding.room.phase !== 'playing') {
          sendError(conn, 'invalid_phase');
          return;
        }
        binding.room.attributes = undefined;
        binding.room.entries = [];
        binding.room.currentTurnPlayerId = undefined;
        binding.room.phase = 'generating';
        broadcast(binding.room);
        return;
      }
      case 'skip_player': {
        if (!binding?.player.isHost) {
          sendError(conn, 'not_host');
          return;
        }
        if (binding.room.phase !== 'playing') {
          sendError(conn, 'invalid_phase');
          return;
        }
        if (binding.room.entries.some(entry => entry.pending)) {
          sendError(conn, 'judge_pending');
          return;
        }
        advanceTurn(binding.room);
        broadcast(binding.room);
        return;
      }
      case 'start_game': {
        if (!binding?.player.isHost) {
          sendError(conn, 'not_host');
          return;
        }
        if (binding.room.phase !== 'lobby') {
          sendError(conn, 'invalid_phase');
          return;
        }
        binding.room.phase = 'generating';
        broadcast(binding.room);
        return;
      }
      case 'submit_item': {
        if (!binding) {
          sendError(conn, 'invalid_phase');
          return;
        }
        submitItem(
          conn,
          binding.room,
          binding.player,
          message.word,
          message.description,
          message.guesses,
        );
        return;
      }
      default: {
        const _exhaustiveCheck: never = message;
        break;
      }
    }
  };

  const manager: RoomManager = {
    connections,
    handleConnect: conn => {
      connections.add(conn);
    },
    handleDisconnect: conn => {
      connections.delete(conn);
      const binding = bindings.get(conn);
      if (!binding) return;
      bindings.delete(conn);
      const { player, room } = binding;
      if (player.isHost) {
        dissolve(room);
        return;
      }
      player.connected = false;
      player.conn = undefined;
      console.log(`[room ${room.code}] ${player.name} disconnected`);
      if (room.currentTurnPlayerId === player.id) {
        advanceTurn(room);
      }
      broadcast(room);
    },
    handleMessage: (conn, raw) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        sendError(conn, 'invalid_message');
        return;
      }
      const result = v.safeParse(clientMessageSchema, parsed);
      if (!result.success) {
        sendError(conn, 'invalid_message');
        return;
      }
      dispatch(conn, result.output);
    },
  };

  return manager;
}
