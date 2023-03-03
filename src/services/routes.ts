import { IncomingMessage, ServerResponse } from "http";
import { WebSocket } from "ws";

import {
  AnswerData,
  ConnectData,
  ResetData,
  StatusData,
} from "../types/data";
import { AddConnection, Broadcast, Group, Groups, Send } from "../types/groups";

import { initPoll } from "./data";
import { initGroup, removeOldGroups, updateGroup } from "./groups";
import { log, LogLevel } from "./log";

export function getRoutes<
  T extends WebSocket | ServerResponse<IncomingMessage>
>(groups: Groups, send: Send<T>, broadcast: Broadcast<T>, addConnection: AddConnection<T>) {
  return {
    connect(data: ConnectData, connection: T) {
      if (data.id) {
        log(`Client connected to group "${data.id}"`, LogLevel.WARN);
        addConnection(connection, data.id);
        removeOldGroups(groups);
        if (!groups.has(data.id)) {
          initGroup(groups, data.id, data.state);
        } else {
          const group = groups.get(data.id) as Group;
          send(connection, group.state);
        }
      }
    },
    reset(data: ResetData) {
      if (data.id && groups.has(data.id)) {
        const group = groups.get(data.id) as Group;
        if (data.pollId && group.state[data.pollId]) {
          group.state[data.pollId] = initPoll(group.state[data.pollId]);
          updateGroup(groups, data.id, group);
          broadcast(data.id, {
            [data.pollId]: group.state[data.pollId],
          });
        } else if (!data.pollId) {
          initGroup(groups, data.id, data.state);
          broadcast(data.id, data.state ?? {});
        }
      }
    },
    // broadcast(data: BroadcastData) {
    //   if (data.id && data.state && groups.has(data.id)) {
    //     const group = groups.get(data.id) as Group;
    //     group.state = data.state;
    //     updateGroup(groups, data.id, group);
    //     broadcast(data.id, group.state);
    //   }
    // },
    answer(data: AnswerData) {
      if (data.id && groups.has(data.id)) {
        const group = groups.get(data.id) as Group;
        if (!group.state[data.pollId]) {
          group.state[data.pollId] = initPoll();
        }
        if (data.pollId && data.userId) {
          group.state[data.pollId].results[data.userId] = data.result;
          updateGroup(groups, data.id, group);
          broadcast(data.id, {
            [data.pollId]: group.state[data.pollId],
          });
        }
      }
    },
    status(data: StatusData) {
      if (data.id && groups.has(data.id)) {
        const group = groups.get(data.id) as Group;
        if (!group.state[data.pollId]) {
          group.state[data.pollId] = initPoll();
        }
        if (data.pollId && data.status) {
          group.state[data.pollId].status = data.status;
          updateGroup(groups, data.id, group);
          broadcast(data.id, {
            [data.pollId]: group.state[data.pollId],
          });
        }
      }
    },
  };
}
