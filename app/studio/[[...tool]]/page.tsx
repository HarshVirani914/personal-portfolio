import { Studio } from "./studio";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return (
      <p style={{ padding: 32, fontFamily: "system-ui" }}>
        Set NEXT_PUBLIC_SANITY_PROJECT_ID to enable the Studio.
      </p>
    );
  }
  return <Studio />;
}
