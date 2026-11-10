import Link from "next/link";
import type { AccountType } from "../auth/auth-context";

const accountChoices: {
  type: AccountType;
  title: string;
  description: string;
  icon: string;
  action: string;
}[] = [
  {
    type: "client",
    title: "I need help at home",
    description:
      "Find household professionals who fit your needs, location, and routine.",
    icon: "⌂",
    action: "I’m hiring",
  },
  {
    type: "provider",
    title: "I’m looking for work",
    description:
      "Join as a household professional and share the skills you bring to a home.",
    icon: "✳",
    action: "I’m a professional",
  },
];

export default function SignupRolePicker({
  returnTo,
}: {
  returnTo: string;
}) {
  return (
    <main className="min-h-[70vh] bg-[#faf9f6] px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-800">
            Create your account
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#142236] sm:text-4xl">
            First, what brings you to StaffConnect?
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Choose the option that sounds like you. We’ll set up your account to
            match.
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          {accountChoices.map((choice) => {
            const params = new URLSearchParams({
              role: choice.type,
              next: returnTo,
            });

            return (
              <Link
                key={choice.type}
                href={`/signup?${params.toString()}`}
                className="group flex min-h-28 items-center gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 sm:gap-5 sm:p-6"
              >
                <span
                  aria-hidden="true"
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-50 text-2xl font-semibold text-amber-800"
                >
                  {choice.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-bold text-[#142236]">
                    {choice.title}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">
                    {choice.description}
                  </span>
                </span>
                <span className="hidden shrink-0 items-center gap-2 text-sm font-semibold text-amber-800 sm:flex">
                  {choice.action}
                  <span aria-hidden="true" className="text-lg transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-xl text-slate-400 sm:hidden"
                >
                  →
                </span>
              </Link>
            );
          })}
        </div>

        <p className="mt-7 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href={`/signin?next=${encodeURIComponent(returnTo)}`}
            className="font-semibold text-amber-800 underline underline-offset-4 hover:text-amber-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
