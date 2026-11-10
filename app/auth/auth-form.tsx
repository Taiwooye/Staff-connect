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
  const accountType = initialRole;
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const switchModeHref =
    mode === "signup"
      ? `/signin?next=${encodeURIComponent(returnTo)}`
      : `/signup?next=${encodeURIComponent(returnTo)}`;
  const rolePickerHref = `/signup?next=${encodeURIComponent(returnTo)}`;

  if (authStatus === "loading") {
    return (
      <main className="min-h-[70vh] bg-[#faf9f6] px-4 py-16">
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
      <main className="min-h-[70vh] bg-[#faf9f6] px-4 py-10 sm:px-6 sm:py-16">
        <section className="mx-auto max-w-lg rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-800">
            Your StaffConnect account
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
    <main className="min-h-[70vh] bg-[#faf9f6] px-4 py-8 sm:px-6 sm:py-12">
      <section className="mx-auto max-w-lg rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-xl font-extrabold text-[#142236]">
          S
        </div>
        <div className="mt-5 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-800">
            {mode === "signup" ? "Join StaffConnect" : "Your StaffConnect account"}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#142236]">
            {mode === "signup"
              ? `Create your ${accountType === "client" ? "Client" : "Provider"} account`
              : "Welcome back"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {mode === "signup"
              ? "A few details and you’ll be ready to get started."
              : "Sign in to pick up where you left off."}
          </p>
        </div>

        {mode === "signup" && (
          <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl bg-amber-50 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                You’re joining as a
              </p>
              <p className="mt-0.5 font-semibold text-[#142236]">
                {accountType === "client"
                  ? "Client · I need help at home"
                  : "Provider · I’m looking for work"}
              </p>
            </div>
            <Link
              href={rolePickerHref}
              className="shrink-0 text-sm font-semibold text-amber-900 underline underline-offset-4 hover:text-amber-700"
            >
              Change
            </Link>
          </div>
        )}

        {!configured && (
          <aside className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            <strong>We’re getting accounts ready.</strong>{" "}
            {mode === "signup"
              ? "Creating an account isn’t available just yet. You can still explore household profiles."
              : "Signing in isn’t available just yet. You can still explore household profiles."}
            <Link
              href="/maids"
              className="ml-1 font-semibold underline underline-offset-4"
            >
              Browse profiles
            </Link>
          </aside>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <fieldset
            disabled={!configured || isSubmitting}
            className="space-y-4 disabled:opacity-60"
          >
            {mode === "signup" && (
              <label className="block text-sm font-semibold text-slate-800">
                What should we call you?
                <input
                  autoComplete="name"
                  required
                  maxLength={80}
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Your name"
                  className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 font-normal outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
              </label>
            )}

            <label className="block text-sm font-semibold text-slate-800">
              Email address
              <input
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 font-normal outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              Password
              <span className="mt-2 flex h-12 items-center rounded-xl border border-slate-300 pr-3 transition focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                  minLength={mode === "signup" ? 10 : undefined}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={mode === "signup" ? "At least 10 characters" : "Your password"}
                  className="h-full min-w-0 flex-1 rounded-xl bg-transparent px-4 font-normal outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="shrink-0 rounded px-1 text-xs font-semibold text-slate-600 hover:text-[#142236] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </span>
              {mode === "signup" && (
                <span className="mt-1.5 block text-xs font-normal text-slate-500">
                  Use 10 characters or more.
                </span>
              )}
            </label>
          </fieldset>

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
            disabled={!configured || isSubmitting}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#142236] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#20334c] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Please wait..."
              : mode === "signup"
                ? "Create my account"
                : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          {mode === "signup" ? "Already have an account?" : "New to StaffConnect?"}{" "}
          <Link
            href={switchModeHref}
            className="font-semibold text-amber-800 underline underline-offset-4 hover:text-amber-700"
          >
            {mode === "signup" ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </section>
    </main>
  );
}
