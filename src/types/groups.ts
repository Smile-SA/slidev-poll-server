import { IncomingMessage, ServerResponse } from "http";
import { WebSocket } from "ws";

import { PollState } from "./polls";

export interface Group {
  created: Date;
  state: PollState;
  updated: Date;
}

export type Groups = Map<string, Group>;

export type SseConnections = Map<ServerResponse<IncomingMessage>, string>;
export type WsConnections = Map<WebSocket, string>;
export type Connections<T extends WebSocket | ServerResponse<IncomingMessage>> =
  Map<T, string>;

export type Send<T extends WebSocket | ServerResponse<IncomingMessage>> = (
  connection: T,
  data: unknown
) => void;
export type Broadcast<T extends WebSocket | ServerResponse<IncomingMessage>> = (
  groupId: string,
  state: PollState,
  connection?: T
) => void;
export type AddConnection<
  T extends WebSocket | ServerResponse<IncomingMessage>
> = (connection: T, groupId: string) => void;
