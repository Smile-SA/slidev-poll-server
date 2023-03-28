import {
  DataType,
  WsAnswerData,
  WsBroadcastData,
  WsConnectData,
  WsData,
  WsLoginData,
  WsResetData,
  WsStatusData,
} from "../types/data";
import { Poll, PollStatus } from "../types/polls";

export function isAnswerData(data: WsData): data is WsAnswerData {
  return data.type === DataType.ANSWER;
}

export function isBroadcastData(data: WsData): data is WsBroadcastData {
  return data.type === DataType.BROADCAST;
}

export function isConnectData(data: WsData): data is WsConnectData {
  return data.type === DataType.CONNECT;
}

export function isResetData(data: WsData): data is WsResetData {
  return data.type === DataType.RESET;
}

export function isStatusData(data: WsData): data is WsStatusData {
  return data.type === DataType.STATUS;
}

export function isLoginData(data: WsData): data is WsLoginData {
  return data.type === DataType.LOGIN;
}

export function initPoll(poll?: Poll): Poll {
  return {
    ...poll,
    results: {},
    status: PollStatus.CLEAR,
  };
}
