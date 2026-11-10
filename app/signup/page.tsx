import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "../auth/auth-form";
import { getLocalReturnPath } from "../auth/return-path";
import SignupRolePicker from "./role-picker";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Choose how you’ll use StaffConnect, then create your account.",
};

async function SignupPageContent({
  searchParams,
}: Pick<PageProps<"/signup">, "searchParams">) {
  const params = await searchParams;
  const returnTo = getLocalReturnPath(params.next);
  const role =
    params.role === "client" || params.role === "provider" ? params.role : null;

  if (!role) return <SignupRolePicker returnTo={returnTo} />;

  return (
    <AuthForm
      mode="signup"
      initialRole={role}
      returnTo={returnTo}
      callbackError=""
    />
  );
}

export default function SignupPage({
  searchParams,
}: PageProps<"/signup">) {
  return (
    <Suspense
      fallback={
        <main className="min-h-[70vh] bg-[#faf9f6] px-4 py-16">
          <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 text-sm text-slate-600 shadow-sm">
            Getting your account options ready...
          </div>
        </main>
      }
    >
      <SignupPageContent searchParams={searchParams} />
    </Suspense>
  );
}
