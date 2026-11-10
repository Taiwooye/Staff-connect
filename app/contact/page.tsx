import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact StaffConnect",
  description:
    "Find the right next step for households and household professionals using StaffConnect.",
};

const contactPaths = [
  {
    eyebrow: "For households",
    title: "Looking for help at home?",
    description:
      "Explore sample profiles by service, skills, location, and work arrangement.",
    action: "Browse household help",
    href: "/maids",
    icon: "⌕",
    style: "bg-amber-50 text-amber-900",
  },
  {
    eyebrow: "For professionals",
    title: "Looking for household work?",
    description:
      "Create a Provider account first, then explore the temporary work-profile preview.",
    action: "Create a Provider account",
    href: "/signup?role=provider&next=%2Faccount",
    icon: "✳",
    style: "bg-emerald-50 text-emerald-900",
  },
  {
    eyebrow: "Not sure where to start?",
    title: "Choose your account type.",
    description:
      "Select Client if you’re hiring, or Provider if you’re looking for work.",
    action: "Choose an account type",
    href: "/onboarding",
    icon: "↗",
    style: "bg-sky-50 text-sky-900",
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#faf9f6] px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[2.5rem] bg-[#142236] px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-16">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">
            Contact us
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Let’s get you to the right place.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Whether you’re looking for help at home or looking for work, start
            with the path that fits you.
          </p>
        </section>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {contactPaths.map((path) => (
            <article
              key={path.title}
              className="flex flex-col rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-7"
            >
              <span
                aria-hidden="true"
                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${path.style}`}
              >
                {path.icon}
              </span>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                {path.eyebrow}
              </p>
              <h2 className="mt-2 text-xl font-bold text-[#142236]">
                {path.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                {path.description}
              </p>
              <Link
                href={path.href}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-[#142236] transition hover:border-amber-400 hover:bg-amber-50"
              >
                {path.action}
                <span aria-hidden="true" className="ml-2">→</span>
              </Link>
            </article>
          ))}
        </div>

        <aside className="mt-8 rounded-[2rem] border border-amber-200 bg-amber-50 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <span
              aria-hidden="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-xl text-amber-800"
            >
              i
            </span>
            <div>
              <h2 className="font-bold text-amber-950">A note about contacting us</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-amber-900">
                StaffConnect is currently a prototype and does not have a
                connected support inbox or phone line yet. We haven’t listed
                placeholder contact details, and messages cannot be sent through
                this site. Please use the links above to explore the prototype.
              </p>
            </div>
          </div>
        </aside>

        <p className="mt-8 text-center text-sm text-slate-500">
          Want to learn more about what we’re building?{" "}
          <Link
            href="/about"
            className="font-semibold text-amber-800 underline underline-offset-4 hover:text-amber-700"
          >
            About StaffConnect
          </Link>
        </p>
      </div>
    </main>
  );
}
