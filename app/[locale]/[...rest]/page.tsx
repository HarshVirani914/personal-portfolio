import { notFound } from "next/navigation";

/** Sends unknown paths to the localized 404 instead of Next's bare default. */
export default function UnknownPage() {
  notFound();
}
