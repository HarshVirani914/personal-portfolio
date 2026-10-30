import type { AgentStore, CachedAnswer, LogEntry } from "@/lib/agent/store";

/** An in-memory store for tests. `fail` and `failWrites` simulate an outage. */
export function createFakeStore() {
  const answers = new Map<string, CachedAnswer>();
  const salts = new Map<string, string>();
  const visits = new Map<string, number>();
  const spent = new Map<string, number>();

  const fake = {
    calls: 0,
    fail: false,
    failWrites: false,
    entries: [] as LogEntry[],
    spent: (day: string) => spent.get(day) ?? 0,
    visits: () => [...visits.values()].reduce((sum, n) => sum + n, 0),
    answers: () => [...answers.values()],
    dump: () => ({
      answers: [...answers],
      salts: [...salts],
      visits: [...visits],
      entries: fake.entries,
    }),
  };

  const read = () => {
    fake.calls += 1;
    if (fake.fail) throw new Error("store down");
  };
  const write = () => {
    read();
    if (fake.failWrites) throw new Error("store down");
  };

  const store: AgentStore = {
    async readAnswer(key) {
      read();
      return answers.get(key) ?? null;
    },
    async writeAnswer(key, answer) {
      write();
      answers.set(key, answer);
    },
    async daySalt(day, fresh) {
      read();
      const salt = salts.get(day) ?? fresh;
      salts.set(day, salt);
      return salt;
    },
    async countVisit(day, visitor) {
      read();
      const key = `${day}:${visitor}`;
      const count = (visits.get(key) ?? 0) + 1;
      visits.set(key, count);
      return count;
    },
    async spend(day, tokens) {
      read();
      const total = (spent.get(day) ?? 0) + tokens;
      spent.set(day, total);
      return total;
    },
    async log(entry) {
      write();
      fake.entries.push(entry);
    },
  };

  return Object.assign(fake, store);
}
