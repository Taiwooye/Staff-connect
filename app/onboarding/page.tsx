import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Get started",
  description: "Choose an account type to preview StaffConnect onboarding.",
};

const roles = [
  {
    href: "/onboarding/client",
    eyebrow: "I’m hiring",
    title: "I need household help",
    description:
      "Share the kind of help you need, your Lagos area, and the work arrangement that suits your household.",
    action: "Continue as an employer",
  },
  {
    href: "/onboarding/provider",
    eyebrow: "I’m looking for work",
    title: "I’m a housemaid",
    description:
      "Create a simple work profile with your skills, preferred arrangement, and availability.",
    action: "Continue as a housemaid",
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
            A safer home-work connection starts here.
          </h1>
          <p className="mt-4 leading-relaxed text-slate-600">
            Choose the path that fits you. We’ll ask only for the information needed to
            preview your profile.
          </p>
        </div>

        <aside className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
          <strong>Prototype, not account registration.</strong> Use fictional details only.
          This preview does not send your information to a server, save it to your device,
          verify identity, or create an account. Refreshing or closing this tab clears your
          profile preview.
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
