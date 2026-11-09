import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Get started",
  description: "Choose whether you are joining StaffConnect as a Client or Provider.",
};

const roles = [
  {
    href: "/auth?mode=signup&role=client&next=%2Faccount",
    eyebrow: "CLIENT ACCOUNT · I’M HIRING",
    title: "I need household help",
    description:
      "Create a Client account to explore household professionals and save profiles you want to revisit.",
    action: "Create a Client account",
  },
  {
    href: "/auth?mode=signup&role=provider&next=%2Faccount",
    eyebrow: "PROVIDER ACCOUNT · I’M LOOKING FOR WORK",
    title: "I’m a household professional",
    description:
      "Create a Provider account first. You can then open a temporary work-profile preview from your account.",
    action: "Create a Provider account",
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
            Are you a client hiring household help, or a provider looking for work? Choose
            the matching account type to continue.
          </p>
        </div>

        <aside className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
          <strong>Your account type stays with your account.</strong> After signing up,
          you’ll see whether you joined as a Client or Provider on your account page.
          Provider work-profile previews are not yet published or permanently saved.
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
