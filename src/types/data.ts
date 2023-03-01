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
  type: DataType;
}

export interface AnswerData extends Data {
  pollId: string;
  userId: string;
  result: Result;
  type: DataType.ANSWER;
}

export interface BroadcastData extends Data {
  state: PollState;
  type: DataType.BROADCAST;
}

export interface ConnectData extends Data {
  state?: PollState;
  type: DataType.CONNECT;
}

export interface ResetData extends Data {
  pollId?: string;
  state?: PollState;
  type: DataType.RESET;
}

export interface StatusData extends Data {
  pollId: string;
  status: PollStatus
  type: DataType.STATUS;
}
