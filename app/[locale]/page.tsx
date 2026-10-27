import { HeroName } from "@/components/site/hero-name";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <main id="main" className="px-5 md:px-10 lg:px-16">
      <section className="flex min-h-dvh flex-col justify-center pt-24 pb-16">
        <HeroName first={site.firstName} last={site.lastName} />
      </section>
    </main>
  );
}
