"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth, type AccountType } from "./auth-context";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";
import { isSupabaseConfigured } from "../../lib/supabase/config";

type AuthMode = "signin" | "signup";

export default function AuthForm({
  mode: initialMode,
  initialRole,
  returnTo,
  callbackError,
}: {
  mode: AuthMode;
  initialRole: AccountType;
  returnTo: string;
  callbackError: string;
}) {
  const router = useRouter();
  const { status: authStatus, accountType: signedInAccountType } = useAuth();
  const configured = isSupabaseConfigured();
  const mode = initialMode;
  const [accountType, setAccountType] = useState<AccountType>(initialRole);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(callbackError);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setError("Sign-in is unavailable because Supabase is not configured.");
        return;
      }

      if (mode === "signup") {
        const callbackUrl = new URL("/auth/callback", window.location.origin);
        callbackUrl.searchParams.set("next", returnTo);

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              account_type: accountType,
              display_name: displayName.trim(),
            },
            emailRedirectTo: callbackUrl.toString(),
          },
        });

        if (signUpError) throw signUpError;

        if (data.session) {
          router.replace(returnTo);
          router.refresh();
          return;
        }

        setMessage(
          "Account created. Check your email and confirm your address to finish signing in.",
        );
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) throw signInError;
        router.replace(returnTo);
        router.refresh();
      }
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "We could not complete your request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const switchModeHref = `/auth?mode=${mode === "signup" ? "signin" : "signup"}&next=${encodeURIComponent(returnTo)}`;

  if (authStatus === "loading") {
    return (
      <main className="min-h-screen bg-[#faf9f6] px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-sm">
          Checking your account...
        </div>
      </main>
    );
  }

  if (authStatus === "signed-in") {
    const accountLabel = signedInAccountType
      ? signedInAccountType === "client"
        ? "Client"
        : "Provider"
      : null;
    return (
      <main className="min-h-screen bg-[#faf9f6] px-4 py-10 sm:px-6 sm:py-16">
        <section className="mx-auto max-w-xl rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-800">
            StaffConnect account
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#142236]">
            {accountLabel
              ? `You’re already signed in as a ${accountLabel}.`
              : "You’re already signed in."}
          </h1>
          <p className="mt-3 leading-6 text-slate-600">
            {accountLabel
              ? "Your account type is saved. Sign out from your account page before creating a separate account with a different type."
              : "Your account type could not be loaded. Open your account page to retry before continuing."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={returnTo}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#142236] px-5 py-3 text-sm font-semibold text-white hover:bg-[#20334c]"
            >
              Continue
            </Link>
            <Link
              href="/account"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              My account
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-xl">
        <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900">
          ← StaffConnect home
        </Link>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-800">
            StaffConnect account
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#142236]">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {mode === "signup"
              ? "Choose how you’ll use StaffConnect. Your account type stays attached to your account."
              : "Sign in to continue to the page you were viewing."}
          </p>

          {!configured ? (
            <aside className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              <strong>Authentication setup is required.</strong> Add the Supabase
              project URL and publishable key to <code>.env.local</code>, then apply
              the migration in <code>supabase/migrations</code>. See the setup steps
              in the README.
            </aside>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-5">
              {mode === "signup" && (
                <>
                  <fieldset>
                    <legend className="mb-3 text-sm font-semibold text-slate-800">
                      I want to use StaffConnect as:
                    </legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {([
                        ["client", "Client", "I’m hiring household help"],
                        ["provider", "Provider", "I’m looking for work"],
                      ] as const).map(([role, label, description]) => (
                        <label
                          key={role}
                          className={`cursor-pointer rounded-2xl border p-4 transition ${
                            accountType === role
                              ? "border-amber-500 bg-amber-50 ring-2 ring-amber-100"
                              : "border-slate-200 hover:border-amber-300"
                          }`}
                        >
                          <span className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="accountType"
                              value={role}
                              checked={accountType === role}
                              onChange={() => setAccountType(role)}
                              className="mt-1 accent-amber-600"
                            />
                            <span>
                              <span className="block font-semibold text-slate-900">
                                {label}
                              </span>
                              <span className="mt-1 block text-sm text-slate-600">
                                {description}
                              </span>
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <label className="block text-sm font-medium text-slate-700">
                    Your name
                    <input
                      autoComplete="name"
                      required
                      maxLength={80}
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    />
                  </label>
                </>
              )}

              <label className="block text-sm font-medium text-slate-700">
                Email address
                <input
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Password
                <input
                  type="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                  minLength={10}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
                {mode === "signup" && (
                  <span className="mt-1 block text-xs font-normal text-slate-500">
                    Use at least 10 characters.
                  </span>
                )}
              </label>

              {error && (
                <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
                  {error}
                </p>
              )}
              {message && (
                <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#142236] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#20334c] disabled:cursor-wait disabled:opacity-60"
              >
                {isSubmitting
                  ? "Please wait..."
                  : mode === "signup"
                    ? `Create ${accountType === "client" ? "Client" : "Provider"} account`
                    : "Sign in"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-600">
            {mode === "signup" ? "Already have an account?" : "New to StaffConnect?"}{" "}
            <Link
              href={switchModeHref}
              className="font-semibold text-amber-800 underline underline-offset-4"
            >
              {mode === "signup" ? "Sign in" : "Choose an account type and sign up"}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
