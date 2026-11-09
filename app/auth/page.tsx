import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "./auth-form";

export const metadata: Metadata = {
  title: "Sign in or create an account",
  description: "Choose your StaffConnect account type and sign in securely.",
};

function getLocalReturnPath(value: string | string[] | undefined) {
  if (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/auth")
  ) {
    return value;
  }

  return "/account";
}

async function AuthPageContent({
  searchParams,
}: Pick<PageProps<"/auth">, "searchParams">) {
  const params = await searchParams;
  const mode = params.mode === "signup" ? "signup" : "signin";
  const role =
    params.role === "provider" || params.role === "client" ? params.role : "client";

  return (
    <AuthForm
      mode={mode}
      initialRole={role}
      returnTo={getLocalReturnPath(params.next)}
      callbackError={typeof params.error === "string" ? params.error : ""}
    />
  );
}

export default function AuthPage({
  searchParams,
}: PageProps<"/auth">) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#faf9f6] px-4 py-10 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-sm">
            Loading account options...
          </div>
        </main>
      }
    >
      <AuthPageContent searchParams={searchParams} />
    </Suspense>
  );
}
