export type Result = number | number[];

export enum PollStatus {
  CLEAR,
  OPEN,
  CLOSED,
}

export interface Poll {
  results: Record<string, Result>;
  status: PollStatus;
}

export type PollState = Record<string, Poll>;
