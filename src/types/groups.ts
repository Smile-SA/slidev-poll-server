import { IncomingMessage, ServerResponse } from "http";
import { WebSocket } from "ws";

import { SendType } from "./data";
import { PollState, UserState } from "./polls";

export interface Group {
  created: Date;
  polls: PollState;
  updated: Date;
  users: Record<string, string>;
}

export type Groups = Map<string, Group>;

export type SseConnections = Map<ServerResponse<IncomingMessage>, string>;
export type WsConnections = Map<WebSocket, string>;
export type Connections<T extends WebSocket | ServerResponse<IncomingMessage>> =
  Map<T, string>;

export type Send<T extends WebSocket | ServerResponse<IncomingMessage>> = (
  connection: T,
  data: unknown,
  type?: SendType,
) => void;
export type Broadcast<T extends WebSocket | ServerResponse<IncomingMessage>> = (
  groupId: string,
  state: PollState | UserState,
  type?: SendType,
  connection?: T,
) => void;
export type AddConnection<
  T extends WebSocket | ServerResponse<IncomingMessage>
> = (connection: T, groupId: string) => void;
