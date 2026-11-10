import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "../auth/auth-form";
import { getLocalReturnPath } from "../auth/return-path";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your StaffConnect account.",
};

async function SigninPageContent({
  searchParams,
}: Pick<PageProps<"/signin">, "searchParams">) {
  const params = await searchParams;
  const callbackError =
    params.error === "callback_failed"
      ? "We couldn’t confirm your email. Please try the link again."
      : "";

  return (
    <AuthForm
      mode="signin"
      initialRole="client"
      returnTo={getLocalReturnPath(params.next)}
      callbackError={callbackError}
    />
  );
}

export default function SigninPage({
  searchParams,
}: PageProps<"/signin">) {
  return (
    <Suspense
      fallback={
        <main className="min-h-[70vh] bg-[#faf9f6] px-4 py-16">
          <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 text-sm text-slate-600 shadow-sm">
            Getting your sign-in page ready...
          </div>
        </main>
      }
    >
      <SigninPageContent searchParams={searchParams} />
    </Suspense>
  );
}
