import { PollState, PollStatus, Result } from "./polls";

export enum DataType {
  ANSWER = "answer",
  BROADCAST = "broadcast",
  CONNECT = "connect",
  RESET = "reset",
  STATUS = "status",
}

export interface Data {
  id: string;
}

export interface WsData extends Data {
  type: DataType;
}

export interface AnswerData extends Data {
  pollId: string;
  userId: string;
  result: Result;
}

export interface WsAnswerData extends AnswerData {
  type: DataType.ANSWER;
}

export interface BroadcastData extends Data {
  state: PollState;
}

export interface WsBroadcastData extends BroadcastData {
  type: DataType.BROADCAST;
}

export interface ConnectData extends Data {
  state?: PollState;
}

export interface WsConnectData extends ConnectData {
  type: DataType.CONNECT;
}

export interface ResetData extends Data {
  pollId?: string;
  state?: PollState;
}

export interface WsResetData extends ResetData {
  type: DataType.RESET;
}

export interface StatusData extends Data {
  pollId: string;
  status: PollStatus;
}

export interface WsStatusData extends StatusData {
  type: DataType.STATUS;
}
