import { IncomingMessage, ServerResponse } from "http";
import { WebSocket } from "ws";

import {
  AnswerData,
  ConnectData,
  LoginData,
  ResetData,
  SendType,
  StatusData,
} from "../types/data";
import { AddConnection, Broadcast, Group, Groups, Send } from "../types/groups";
import { UserState } from "../types/polls";

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
          send(connection, group.polls);
          send(connection, group.users, SendType.USER);
        }
      }
    },
    reset(data: ResetData) {
      if (data.id && groups.has(data.id)) {
        const group = groups.get(data.id) as Group;
        if (data.pollId && group.polls[data.pollId]) {
          group.polls[data.pollId] = initPoll(group.polls[data.pollId]);
          updateGroup(groups, data.id, group);
          broadcast(data.id, {
            [data.pollId]: group.polls[data.pollId],
          });
        } else if (!data.pollId) {
          initGroup(groups, data.id, data.state);
          broadcast(data.id, data.state ?? {});
        }
      }
    },
    answer(data: AnswerData) {
      if (data.id && groups.has(data.id)) {
        const group = groups.get(data.id) as Group;
        if (!group.polls[data.pollId]) {
          group.polls[data.pollId] = initPoll();
        }
        if (data.pollId && data.userId) {
          group.polls[data.pollId].results[data.userId] = data.result;
          updateGroup(groups, data.id, group);
          broadcast(data.id, {
            [data.pollId]: group.polls[data.pollId],
          });
        }
      }
    },
    status(data: StatusData) {
      if (data.id && groups.has(data.id)) {
        const group = groups.get(data.id) as Group;
        if (!group.polls[data.pollId]) {
          group.polls[data.pollId] = initPoll();
        }
        if (data.pollId && data.status) {
          group.polls[data.pollId].status = data.status;
          updateGroup(groups, data.id, group);
          broadcast(data.id, {
            [data.pollId]: group.polls[data.pollId],
          });
        }
      }
    },
    login(data: LoginData) {
      if (data.id && groups.has(data.id)) {
        const group = groups.get(data.id) as Group;
        if (data.userId && data.userName) {
          group.users[data.userId] = data.userName;
          updateGroup(groups, data.id, group);
          broadcast(data.id, {
            [data.userId]: data.userName,
          }, SendType.USER);
        }
      }
    }
  };
}
