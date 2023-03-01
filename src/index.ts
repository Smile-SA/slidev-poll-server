import { WebSocketServer } from 'ws'

import { initPoll, isAnswerData, isBroadcastData, isConnectData, isResetData, isStatusData } from './services/data';
import { initGroup, removeOldGroups, updateGroup } from './services/groups';
import { log, LogLevel } from './services/log';
import { broadcast, send } from './services/websocket';
import { Connections, Group, Groups } from './types/groups';

const groups: Groups = new Map();
const connections: Connections = new Map();
const port = Number(process.env.PORT ?? 8080);
const wss = new WebSocketServer({ port });

wss.on("connection", ws => {
  ws.on("message", (message: string) => {
    const data = JSON.parse(message);
    log("--- RECEIVED ---");
    log(data);
    if (isConnectData(data)) {
      if (data.id) {
        log(`Client connected to group "${data.id}"`, LogLevel.WARN);
        connections.set(ws, data.id);
        removeOldGroups(groups);
        if (!groups.has(data.id)) {
          initGroup(groups, data.id, data.state)
        } else {
          const group = groups.get(data.id) as Group;
          send(ws, group.state);
        }
      }
    } else if (isResetData(data)) {
      if (data.id && groups.has(data.id)) {
        const group = groups.get(data.id) as Group;
        if (data.pollId && group.state[data.pollId]) {
          group.state[data.pollId] = initPoll(group.state[data.pollId]);
          updateGroup(groups, data.id, group);
          broadcast(data.id, connections, { [data.pollId]: group.state[data.pollId] });
        } else if (!data.pollId) {
          initGroup(groups, data.id, data.state)
          broadcast(data.id, connections, data.state ?? {});
        }
      }
    } else if (isBroadcastData(data)) {
      if (data.id && data.state && groups.has(data.id)) {
        const group = groups.get(data.id) as Group;
        group.state = data.state;
        updateGroup(groups, data.id, group);
        broadcast(data.id, connections, group.state);
      }
    } else if (isAnswerData(data)) {
      if (data.id && groups.has(data.id)) {
        const group = groups.get(data.id) as Group;
        if (!group.state[data.pollId]) {
          group.state[data.pollId] = initPoll();
        }
        if (data.pollId && data.userId) {
          group.state[data.pollId].results[data.userId] = data.result;
          updateGroup(groups, data.id, group);
          broadcast(data.id, connections, { [data.pollId]: group.state[data.pollId] });
        }
      }
    } else if (isStatusData(data)) {
      if (data.id && groups.has(data.id)) {
        const group = groups.get(data.id) as Group;
        if (!group.state[data.pollId]) {
          group.state[data.pollId] = initPoll();
        }
        if (data.pollId && data.status) {
          group.state[data.pollId].status = data.status;
          updateGroup(groups, data.id, group);
          broadcast(data.id, connections, { [data.pollId]: group.state[data.pollId] });
        }
      }
    }
  });

  ws.on("close", () => {
    connections.delete(ws);
  });

  ws.onerror = function () {
    log("Some Error occurred", LogLevel.ERROR);
  };
});

log(`The WebSocket server is running on port ${port}`, LogLevel.INFO, true);
