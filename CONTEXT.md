# Portfolio

Harsh Virani's bilingual portfolio. It sells his work to recruiters and engineers, with all visitor-facing content coming from the CMS.

## Language

### Agent

**Agent**:
The "Ask me anything" feature, which answers one visitor question at a time from the Knowledge View.
_Avoid_: Chatbot, assistant, AI

**Knowledge View**:
The subset of published CMS content the Agent may answer from. It holds research titles, summaries and abstracts, but not research body sections.
_Avoid_: Context, full content, corpus

**Citation**:
A reference by slug from part of an answer to a project or research item in the Knowledge View, shown to the visitor as a chip in that item's accent colour.
_Avoid_: Source, link, reference

**Suggested Question**:
A ready-made question offered in the overlay so a visitor can ask without typing.
_Avoid_: Prompt, example, starter

**Answer Cache**:
Stored answers reused for the same normalized question, locale and Knowledge View, so a repeat question spends no Quota Budget.
_Avoid_: Memory, history

**Quota Budget**:
The share of the model provider's free daily allowance the Agent may spend before it stops making model calls.
_Avoid_: Credits, limit, rate limit

**Handoff**:
A card offering the visitor a prewritten email to Harsh, which they review and send from their own mail app. It appears on an Unknown or Unavailable outcome and when a visitor is over their limit.
_Avoid_: Contact form, fallback, escalation

### Outcomes

**Answered**:
The Knowledge View covers the question, so the visitor gets an answer with Citations.

**Unknown**:
The question is about Harsh but the Knowledge View does not cover it, so the visitor gets a Handoff.
_Avoid_: Failure, error

**Refused**:
The question is off-topic or tries to misuse the Agent, so the visitor gets a short polite line and no Handoff.
_Avoid_: Blocked, rejected

**Unavailable**:
The Agent cannot answer right now because the Quota Budget is spent or a service it needs is down, so the visitor gets a Handoff.
_Avoid_: Offline, broken
