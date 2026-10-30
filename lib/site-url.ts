const LOCAL_SITE_URL = "http://localhost:3000";

/**
 * The public origin, without a trailing slash. NEXT_PUBLIC_SITE_URL is the one
 * setting to change for a custom domain. Vercel's deployment URL keeps preview
 * links pointing at the preview itself.
 */
export const getSiteUrl = (): string => {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  if (!fromEnv) {
    return LOCAL_SITE_URL;
  }

  const url = fromEnv.startsWith("http") ? fromEnv : `https://${fromEnv}`;
  return url.replace(/\/+$/, "");
};
