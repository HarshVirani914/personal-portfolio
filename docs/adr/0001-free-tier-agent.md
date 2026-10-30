# The Agent stays on free tiers, so abuse costs availability and never money

The Agent runs on Groq's free tier with no card on file. A visitor or attacker can therefore cause an outage but never a bill. That tier allows `openai/gpt-oss-20b` about 8K tokens a minute and 200K a day, and sending all published content costs about 5.5K tokens per question, or roughly one question a minute. So we deviate from the "full content, no retrieval" plan in issue #11: the Knowledge View drops research body sections, each question stands alone with no history, and Upstash Redis on its free plan holds the Answer Cache, per-IP limits and Quota Budget, which Vercel's WAF cannot provide because its counters are per region and its window stops at 10 minutes.

## Considered Options

- **Paid Groq plan with a spend limit:** rejected, because quota abuse would then cost money.
- **Full content with prompt caching only:** rejected as the sole measure, because it was unverified whether the free tier gets the cache discount, and without it capacity stays at about one question a minute.
- **No shared store:** rejected, because an attacker rotating IPs could end the Agent for the day and repeat questions would still spend quota.

## Consequences

Deep thesis questions get abstract-level answers plus a Citation to the full page. When the Quota Budget runs out, the Agent stops making model calls until the daily reset and the overlay offers a Handoff. Adding a card to Upstash upgrades it to pay-as-you-go, so the database must stay card-free to keep this guarantee.
