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
export type UserState = Record<string, string>;

export interface State {
  users: UserState;
  polls: PollState;
}
