import { createSignal, type Accessor } from 'solid-js';
import * as v from 'valibot';

import {
  type AreaAttributes,
  type ClientMessage,
  type ErrorCode,
  type RoomSnapshot,
  type ServerMessage,
  serverMessageSchema,
  type VennArea,
} from '../../shared/protocol';

export type LinkState = 'connected' | 'connecting' | 'disconnected';

interface StoredSession {
  code: string;
  name: string;
}

const SESSION_KEY = 'online_session';
const PLAYER_NAME_KEY = 'player_name';
const MAX_RECONNECT_ATTEMPTS = 3;

const storedSessionSchema = v.object({
  code: v.string(),
  name: v.string(),
});

const loadSession = (): StoredSession | undefined => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw === null) return undefined;
    const parsed = v.parse(storedSessionSchema, JSON.parse(raw));
    return { code: parsed.code, name: parsed.name };
  } catch {
    return undefined;
  }
};

const saveSession = (session: StoredSession): void => {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Private browsing may block storage; the room still works without it.
  }
};

const clearSession = (): void => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage failures.
  }
};

export const savePlayerName = (name: string): void => {
  try {
    localStorage.setItem(PLAYER_NAME_KEY, name);
  } catch {
    // Ignore storage failures.
  }
};

export const loadPlayerName = (): string => {
  try {
    return localStorage.getItem(PLAYER_NAME_KEY) ?? '';
  } catch {
    return '';
  }
};

const [snapshot, setSnapshot] = createSignal<RoomSnapshot | undefined>(
  undefined,
);
const [youId, setYouId] = createSignal<string | undefined>(undefined);
const [linkState, setLinkState] = createSignal<LinkState>('disconnected');
const [lastError, setLastError] = createSignal<
  undefined | { code: ErrorCode; seq: number }
>(undefined);
const [roomClosedSeq, setRoomClosedSeq] = createSignal(0);

let socket: undefined | WebSocket;
let intentionalClose = false;
let reconnectAttempts = 0;
let errorSeq = 0;
let session: StoredSession | undefined = loadSession();

export const hasStoredSession = (): boolean => session !== undefined;

const wsUrl = (): string =>
  `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;

const send = (message: ClientMessage): void => {
  socket?.send(JSON.stringify(message));
};

const resetRoomState = (): void => {
  setSnapshot(undefined);
  setYouId(undefined);
};

const handleMessage = (raw: string): void => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return;
  }
  const result = v.safeParse(serverMessageSchema, parsed);
  if (!result.success) {
    console.error('invalid server message', result.issues);
    return;
  }
  const message: ServerMessage = result.output;
  switch (message.type) {
    case 'error': {
      errorSeq += 1;
      setLastError({ code: message.code, seq: errorSeq });
      if (message.code === 'room_not_found') {
        session = undefined;
        clearSession();
      }
      break;
    }
    case 'room_closed': {
      session = undefined;
      clearSession();
      resetRoomState();
      setRoomClosedSeq(roomClosedSeq() + 1);
      break;
    }
    case 'room_state': {
      reconnectAttempts = 0;
      resetRoomState();
      setSnapshot(message.snapshot);
      setYouId(message.youId);
      const self = message.snapshot.members.find(
        member => member.id === message.youId,
      );
      if (!session || session.code !== message.snapshot.code) {
        session = {
          code: message.snapshot.code,
          name: self?.name ?? '',
        };
        saveSession(session);
      }
      break;
    }
    default: {
      const _exhaustiveCheck: never = message;
      break;
    }
  }
};

/**
 * Connect (or reconnect) to the multiplayer server. A stored session is
 * re-joined automatically, which also covers page refreshes.
 */
export const connectOnline = (): void => {
  if (
    socket !== undefined &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }
  intentionalClose = false;
  setLinkState('connecting');
  const ws = new WebSocket(wsUrl());
  socket = ws;
  ws.addEventListener('open', () => {
    if (socket !== ws) return;
    setLinkState('connected');
    if (session) {
      send({ code: session.code, name: session.name, type: 'join_room' });
    }
  });
  ws.addEventListener('message', event => {
    if (typeof event.data === 'string') {
      handleMessage(event.data);
    }
  });
  ws.addEventListener('close', () => {
    if (socket !== ws) return;
    socket = undefined;
    const wasIntentional = intentionalClose;
    intentionalClose = false;
    setLinkState('disconnected');
    resetRoomState();
    if (wasIntentional) return;
    if (session && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      // Delay so the server sees the old connection as offline first.
      reconnectAttempts += 1;
      setTimeout(() => {
        connectOnline();
      }, reconnectAttempts * 1000);
    }
  });
  // `error` is always followed by `close`, which owns the reconnect logic.
  ws.addEventListener('error', () => {});
};

/** Leave the room (if any) and close the connection without reconnecting. */
export const leaveOnline = (): void => {
  intentionalClose = true;
  session = undefined;
  clearSession();
  socket?.close();
  socket = undefined;
  setLinkState('disconnected');
  resetRoomState();
};

export const createRoom = (name: string): void => {
  savePlayerName(name);
  send({ name, type: 'create_room' });
};

export const joinRoom = (code: string, name: string): void => {
  savePlayerName(name);
  send({ code: code.trim().toUpperCase(), name, type: 'join_room' });
};

export const startGame = (): void => {
  send({ type: 'start_game' });
};

export const restartGame = (): void => {
  send({ type: 'restart_game' });
};

export const skipPlayer = (): void => {
  send({ type: 'skip_player' });
};

export const submitItem = (
  word: string,
  description: string,
  guesses: VennArea,
): void => {
  send({ description, guesses, type: 'submit_item', word });
};

export const sendGenerationResult = (attributes: AreaAttributes): void => {
  send({ attributes, type: 'generation_result' });
};

export const sendGenerationFailed = (message: string): void => {
  send({ message, type: 'generation_failed' });
};

export const sendJudgementResult = (
  entryId: number,
  actual: VennArea,
  explanation: string,
): void => {
  send({ actual, entryId, explanation, type: 'judgement_result' });
};

export const sendJudgementFailed = (entryId: number, message: string): void => {
  send({ entryId, message, type: 'judgement_failed' });
};

export const getSnapshot: Accessor<RoomSnapshot | undefined> = snapshot;
export const getYouId: Accessor<string | undefined> = youId;
export const getLinkState: Accessor<LinkState> = linkState;
export const getLastError: Accessor<
  undefined | { code: ErrorCode; seq: number }
> = lastError;
export const getRoomClosedSeq: Accessor<number> = roomClosedSeq;
