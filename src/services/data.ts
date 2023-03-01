import {
  AnswerData,
  BroadcastData,
  ConnectData,
  Data,
  DataType,
  ResetData,
  StatusData,
} from "../types/data";
import { Poll, PollStatus } from "../types/polls";

export function isAnswerData(data: Data): data is AnswerData {
  return data.type === DataType.ANSWER;
}

export function isBroadcastData(data: Data): data is BroadcastData {
  return data.type === DataType.BROADCAST;
}

export function isConnectData(data: Data): data is ConnectData {
  return data.type === DataType.CONNECT;
}

export function isResetData(data: Data): data is ResetData {
  return data.type === DataType.RESET;
}

export function isStatusData(data: Data): data is StatusData {
  return data.type === DataType.STATUS;
}

export function initPoll(poll?: Poll): Poll {
  return {
    answers: [],
    ...poll,
    results: {},
    status: PollStatus.CLEAR,
  };
}
