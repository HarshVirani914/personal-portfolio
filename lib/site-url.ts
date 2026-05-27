const DEFAULT_SITE_URL = "https://example.com";

export const getSiteUrl = (): string => {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined);

  if (!fromEnv) {
    return DEFAULT_SITE_URL;
  }

  return fromEnv.startsWith("http") ? fromEnv : `https://${fromEnv}`;
};
