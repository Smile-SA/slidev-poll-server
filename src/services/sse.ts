import { createServer, IncomingMessage, ServerResponse } from "http";

import { SseConnections, Groups } from "../types/groups";
import { PollState } from "../types/polls";

import { log } from "./log";
import { getRoutes } from "./routes";

const groups: Groups = new Map();
const connections: SseConnections = new Map();
const users = new Map<string, ServerResponse<IncomingMessage>>();

const headers = {
  "Access-Control-Allow-Origin": process.env.CORS_ORIGIN ?? "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
  "Access-Control-Max-Age": 2592000, // 30 days
};

export function getUrl(
  rawUrl?: string
): [string, Record<string, string | string[]>] {
  if (!rawUrl) {
    return ["", {}];
  }
  const [url, query = ''] = rawUrl.split("?");
  const params = query
    .split("&")
    .reduce<Record<string, string | string[]>>((acc, part) => {
      const [key, value] = part.split("=");
      if (key.endsWith("[]")) {
        acc[key] = acc[key] ? acc[key].concat(value) : [value];
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});
  return [url, params];
}

export function initServer(port: number) {
  const { answer, connect, reset, status } = getRoutes(groups, send, broadcast, addConnection);

  const server = createServer(
    (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
      const [url, params] = getUrl(req.url);
      const uid: string | null = !(params.uid instanceof Array)
        ? params.uid
        : null;
      if (req.headers?.accept == "text/event-stream") {
        if (url === "/event" && uid) {
          users.set(uid, res);
          req.on("close", () => removeConnection(res));
          res.writeHead(200, {
            ...headers,
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
          });
          res.write("\n");
        } else if (!uid) {
          res.writeHead(400);
          res.end();
        } else {
          res.writeHead(404);
          res.end();
        }
      } else if (uid && users.has(uid) && req.method === 'POST') {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
          const data = JSON.parse(body);
          log(`--- RECEIVED (${url}) ---`);
          log(data);
          const connection = users.get(uid)!;
          switch (url) {
            case "/connect":
              connect(data, connection);
              break;
            case "/reset":
              reset(data);
              break;
            case "/answer":
              answer(data);
              break;
            case "/status":
              status(data);
              break;
          }
          res.writeHead(200, headers);
          res.end();
        });
      } else if (req.method === 'OPTIONS') {
        res.writeHead(200, headers);
        res.end();
      } else {
        res.writeHead(400);
        res.end();
      }
    }
  );
  server.listen(port);
}

export function addConnection(
  connection: ServerResponse<IncomingMessage>,
  id: string
) {
  connections.set(connection, id);
}

export function removeConnection(connection: ServerResponse<IncomingMessage>) {
  connections.delete(connection);
}

export function send(res: ServerResponse<IncomingMessage>, data: unknown) {
  if (process.env.DEBUG === "info") {
    log("--- SEND ---");
    log(data);
  }
  res.write("data: " + JSON.stringify(data) + "\n\n");
}

export function broadcast(
  groupId: string,
  state: PollState,
  connection?: ServerResponse<IncomingMessage>
) {
  for (const [conn, id] of connections.entries()) {
    if (groupId === id && conn !== connection) {
      send(conn, state);
    }
  }
}
