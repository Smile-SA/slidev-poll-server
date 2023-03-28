import { Group, Groups } from "../types/groups";
import { PollState } from "../types/polls";

import { log } from "./log";

export function removeOldGroup(groups: Groups, id: string) {
  if (groups.has(id)) {
    const group = groups.get(id) as Group;
    const date = new Date();
    if (date.getTime() - group.updated.getTime() > 1000 * 60 * 60 * 24 * 3) {
      groups.delete(id);
    }
  }
}

export function removeOldGroups(groups: Groups) {
  for (const id of groups.keys()) {
    removeOldGroup(groups, id);
  }
}

export function initGroup(groups: Groups, id: string, state?: PollState) {
  const date = new Date();
  const group = {
    created: date,
    polls: state ?? {},
    users: {},
    updated: date,
  };
  log(`--- INIT GROUP "${id}" ---`);
  log(group);
  groups.set(id, group);
}

export function updateGroup(groups: Groups, id: string, group: Group) {
  group.updated = new Date();
  groups.set(id, group);
  log(`--- GROUP "${id}" DATA ---`);
  log(group);
}
