import { WebSocket } from "ws";

import { PollState } from "./polls";

export interface Group {
  created: Date;
  state: PollState;
  updated: Date;
}

export type Groups = Map<string, Group>;

export type Connections = Map<WebSocket, string>;
