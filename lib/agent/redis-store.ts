import type { Redis } from "@upstash/redis";
import type { AgentStore, CachedAnswer } from "@/lib/agent/store";

const DAY = 60 * 60 * 24;
const ANSWER_TTL = 7 * DAY;
/** Daily keys outlive their day by one, so a request at midnight still finds them. */
const DAILY_TTL = 2 * DAY;
const LOG_KEY = "agent:log";
const LOG_ENTRIES = 1_000;
const LOG_TTL = 90 * DAY;

export function createRedisStore(redis: Redis): AgentStore {
  return {
    readAnswer: (key) => redis.get<CachedAnswer>(`agent:answer:${key}`),

    async writeAnswer(key, answer) {
      await redis.set(`agent:answer:${key}`, answer, { ex: ANSWER_TTL });
    },

    async daySalt(day, fresh) {
      const salt = await redis.set<string>(`agent:salt:${day}`, fresh, {
        nx: true,
        get: true,
        ex: DAILY_TTL,
      });
      return salt ?? fresh;
    },

    async countVisit(day, visitor) {
      const key = `agent:visits:${day}:${visitor}`;
      const [count] = await redis
        .pipeline()
        .incr(key)
        .expire(key, DAILY_TTL)
        .exec<[number, number]>();
      return count;
    },

    async spend(day, tokens) {
      const key = `agent:spent:${day}`;
      const [total] = await redis
        .pipeline()
        .incrby(key, tokens)
        .expire(key, DAILY_TTL)
        .exec<[number, number]>();
      return total;
    },

    // A sorted set, not a list: a list can only expire whole, and steady
    // traffic would keep entries past 90 days.
    async log(entry) {
      await redis
        .pipeline()
        .zadd(LOG_KEY, { score: entry.at, member: JSON.stringify(entry) })
        .zremrangebyscore(LOG_KEY, 0, entry.at - LOG_TTL * 1000)
        .zremrangebyrank(LOG_KEY, 0, -(LOG_ENTRIES + 1))
        .expire(LOG_KEY, LOG_TTL)
        .exec();
    },
  };
}
