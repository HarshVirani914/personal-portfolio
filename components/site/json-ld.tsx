import { serializeSchemas } from "@/lib/structured-data";

export function JsonLd({
  schemas,
}: {
  schemas: Parameters<typeof serializeSchemas>[0];
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeSchemas(schemas) }}
    />
  );
}
