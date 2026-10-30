const SUBJECT_CHARACTERS = 60;

type Handoff = {
  email: string;
  question: string;
  copy: { subject: string; greeting: string; signature: string };
};

/** A prewritten email the visitor reviews and sends from their own mail app. */
export function handoffHref({ email, question, copy }: Handoff) {
  const excerpt = Array.from(question).slice(0, SUBJECT_CHARACTERS).join("");
  const subject = `${copy.subject} ${excerpt}`;
  const body = [copy.greeting, question, copy.signature].join("\r\n\r\n");
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
