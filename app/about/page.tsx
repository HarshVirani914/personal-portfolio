import { AcademicWork } from "@/components/about/academic-work";
import { Education } from "@/components/about/education";
import { Experience } from "@/components/about/experience";
import { PolaroidStrip } from "@/components/about/polaroid-strip";
import { Research } from "@/components/about/research";
import { Skills } from "@/components/about/skills";
import { Stack } from "@/components/about/stack";
import { ContactCard } from "@/components/contact/contact-card";
import { FadeIn } from "@/components/ui/motion-primitives";
import { createMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = createMetadata({
  title: "About",
  description:
    "About Harsh Virani — background in full-stack engineering and AI systems.",
  path: "/about",
});

export default function AboutPage(): ReactNode {
  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-312 pt-40 sm:pt-56">
        <PolaroidStrip />
      </section>

      <section className="mx-auto w-full max-w-160 px-6 pt-20 pb-16 sm:px-10 sm:pt-28 sm:pb-24">
        <FadeIn delay={0.5}>
          <div className="border-foreground/5 bg-foreground/1.5 dark:bg-foreground/3 rounded-4xl border p-8 sm:p-12">
            <h1 className="text-foreground font-serif text-[1.75rem] font-medium tracking-tight sm:text-[2rem]">
              Hello! I&rsquo;m{" "}
              <span className="border-foreground/30 border-b pb-0.5">
                Harsh Virani
              </span>
              .
            </h1>
            <div className="text-foreground/75 mt-8 space-y-6 text-[17px] leading-[1.7] tracking-tight sm:text-[18px]">
              <p>
                I&rsquo;m a{" "}
                <strong className="text-foreground font-semibold">
                  full-stack engineer and AI builder
                </strong>{" "}
                based in Hof, Germany, pursuing an M.Sc. in AI &amp; Robotics. I
                like working where product delivery meets machine learning:
                shipping interfaces people actually use, then backing them with
                RAG pipelines, agents, and models you can evaluate and deploy.
              </p>
              <p>
                Before my master&rsquo;s, I spent nine months as a software
                engineer at TechStaunch on{" "}
                <strong className="text-foreground font-semibold">
                  GoShimmy
                </strong>
                , a production e-commerce platform with tens of thousands of
                daily users. That taught me how to care about CI/CD,
                performance, and real-time features, skills I now apply when
                moving AI prototypes to production.
              </p>
              <p>
                Recent work spans an{" "}
                <strong className="text-foreground font-semibold">
                  agentic support system
                </strong>
                , medical imaging research on chest X-rays, and capstone
                projects in retrieval and health tech. I was named to the{" "}
                <strong className="text-foreground font-semibold">
                  Dean&rsquo;s List
                </strong>{" "}
                at Hof in 2025. I&rsquo;m open to collaborations, Werkstudent
                roles, and research-minded teams building thoughtful AI
                products.
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      <section className="mx-auto w-full max-w-160 px-6 pb-20 sm:px-10 sm:pb-28">
        <FadeIn delay={0.1}>
          <div className="flex flex-col gap-10">
            <Experience />
            <Research />
            <AcademicWork />
            <Education />
            <Skills />
            <Stack />
          </div>
        </FadeIn>
      </section>

      <ContactCard />
      <div className="h-12 sm:h-16" />
    </main>
  );
}
