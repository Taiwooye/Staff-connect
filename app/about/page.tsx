import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About StaffConnect",
  description:
    "Learn about StaffConnect, a prototype designed to help households and household professionals find a better fit.",
};

const principles = [
  {
    number: "01",
    title: "Start with what matters",
    description:
      "Skills, location, and the kind of support a household needs should guide the search.",
  },
  {
    number: "02",
    title: "Make expectations clearer",
    description:
      "Work arrangements and availability help both sides understand whether a role could fit.",
  },
  {
    number: "03",
    title: "Build with care",
    description:
      "Trust takes more than a profile. Verification and privacy practices need thoughtful work before launch.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#faf9f6] px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <section className="relative isolate overflow-hidden rounded-[2.5rem] bg-[#142236] px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-16 lg:py-20">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-32 -z-10 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl"
          />
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">
            About StaffConnect
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Better household connections begin with understanding.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            StaffConnect is being designed to help households and household
            professionals find a better fit through skills, location, and clear
            work expectations.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/maids"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-[#142236] transition hover:bg-amber-300"
            >
              Explore household help
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Choose how to get started
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-9">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-800">
              Our purpose
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#142236] sm:text-3xl">
              A more considered way to find the right support.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Finding help for home is personal. So is looking for meaningful
              household work. We want the process to make relevant skills,
              preferred schedules, and local availability easier to understand
              from the start.
            </p>
            <p className="mt-4 leading-7 text-slate-600">
              Our initial prototype focuses on Lagos and Oyo, with service
              categories that can grow as the platform and its provider
              community develop.
            </p>
          </article>

          <aside className="flex flex-col justify-between rounded-[2rem] bg-amber-100/70 p-6 sm:p-9">
            <div>
              <span
                aria-hidden="true"
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl"
              >
                ✦
              </span>
              <h2 className="mt-5 text-xl font-bold text-[#142236]">
                Thoughtful by design
              </h2>
              <p className="mt-3 leading-7 text-slate-700">
                A good match is about more than a title. The details of the work,
                the place, and the schedule matter.
              </p>
            </div>
            <p className="mt-8 rounded-2xl border border-amber-200/80 bg-white/70 p-4 text-sm leading-6 text-slate-600">
              We aim to make those details easier to explore while treating
              people’s privacy and safety as essential.
            </p>
          </aside>
        </section>

        <section className="mt-12 sm:mt-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-800">
              What guides us
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#142236]">
              The right fit is in the details.
            </h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {principles.map((principle) => (
              <article
                key={principle.number}
                className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-7"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-sm font-bold text-amber-900">
                  {principle.number}
                </span>
                <h3 className="mt-5 text-lg font-bold text-[#142236]">
                  {principle.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {principle.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <aside className="mt-10 rounded-[2rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950 sm:p-7">
          <strong>A prototype in progress.</strong> Sample profiles are fictional
          and are not verified candidates. Profiles created during onboarding
          are temporary previews: they are not published, saved to a server, or
          verified.
        </aside>
      </div>
    </main>
  );
}
