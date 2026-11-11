import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Get started",
  description: "Choose whether you are joining StaffConnect to hire or find work.",
};

const roles = [
  {
    href: "/signup?role=client&next=%2Faccount",
    eyebrow: "HIRER ACCOUNT · I’M HIRING",
    title: "I’m hiring",
    description:
      "Create a hirer account for your household, school, business, event, or team. Post opportunities with your budget and review worker offers.",
    action: "Create a hirer account",
  },
  {
    href: "/signup?role=provider&next=%2Faccount",
    eyebrow: "WORKER ACCOUNT · I’M LOOKING FOR WORK",
    title: "I’m looking for work",
    description:
      "Create your work profile, browse job posts, and respond with the price you’re asking for.",
    action: "Create a worker account",
  },
];

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-[#faf9f6] px-4 py-12 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900">
          ← StaffConnect home
        </Link>
        <div className="mt-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
            Get started
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            First, choose your account type.
          </h1>
          <p className="mt-4 leading-relaxed text-slate-600">
            Are you here to hire people or to find work? Choose the matching account type.
          </p>
        </div>

        <aside className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
          <strong>Your account type guides your StaffConnect experience.</strong> Hirers
          can post opportunities and review worker offers. Workers can create a profile,
          browse jobs, and send their asking price. Prototype posts and offers stay in
          this browser and are not yet shared with other devices.
        </aside>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {roles.map((role) => (
            <article
              key={role.href}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <p className="text-sm font-medium text-amber-700">{role.eyebrow}</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-900">{role.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                {role.description}
              </p>
              <Link
                href={role.href}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
              >
                {role.action}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
