import { WebSocket, WebSocketServer } from "ws";
import { SendType } from "../types/data";

import { Groups, WsConnections } from "../types/groups";
import { PollState, UserState } from "../types/polls";

import { isAnswerData, isConnectData, isLoginData, isResetData, isStatusData } from "./data";
import { log, LogLevel } from "./log";
import { getRoutes } from "./routes";

const groups: Groups = new Map();
const connections: WsConnections = new Map();

export function initServer(port: number) {
  const { answer, connect, login, reset, status } = getRoutes(
    groups,
    send,
    broadcast,
    addConnection
  );

  const wss = new WebSocketServer({ port });
  wss.on("connection", (ws) => {
    ws.on("message", (message: string) => {
      const data = JSON.parse(message);
      log("--- RECEIVED ---");
      log(data);
      if (isConnectData(data)) {
        connect(data, ws);
      } else if (isResetData(data)) {
        reset(data);
      } else if (isAnswerData(data)) {
        answer(data);
      } else if (isStatusData(data)) {
        status(data);
      } else if (isLoginData(data)) {
        login(data);
      }
    });

    ws.on("close", () => {
      connections.delete(ws);
    });

    ws.onerror = function () {
      log("Some Error occurred", LogLevel.ERROR);
    };
  });
}

export function addConnection(connection: WebSocket, id: string) {
  connections.set(connection, id);
}

export function removeConnection(connection: WebSocket) {
  connections.delete(connection);
}

export function send(
  ws: WebSocket,
  data: unknown,
  type: SendType = SendType.POLL
) {
  if (process.env.DEBUG === "info") {
    log("--- SEND ---");
    log(data);
  }
  ws.send(JSON.stringify({ type, data }));
}

export function broadcast(
  groupId: string,
  state: PollState | UserState,
  type: SendType = SendType.POLL,
  connection?: WebSocket
) {
  for (const [conn, id] of connections.entries()) {
    if (groupId === id && conn !== connection) {
      send(conn, state, type);
    }
  }
}
