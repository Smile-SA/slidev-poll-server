import { WebSocket } from "ws";

import { Connections } from "../types/groups";
import { PollState } from "../types/polls";

import { log } from "./log";

export function send( ws: WebSocket, data: unknown) {
  if (process.env.DEBUG === 'info') {
    log("--- SEND ---");
    log(data);
  }
  ws.send(JSON.stringify(data));
}

export function broadcast(
  groupId: string,
  connections: Connections,
  state: PollState,
  ws?: WebSocket
) {
  for (const [connection, id] of connections.entries()) {
    if (groupId === id && connection !== ws) {
      send(connection, state);
    }
  }
}
