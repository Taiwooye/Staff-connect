import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

function getLocalReturnPath(value: string | null) {
  if (value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/auth")) {
    return value;
  }
  return "/account";
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = getLocalReturnPath(request.nextUrl.searchParams.get("next"));
  const supabase = await createSupabaseServerClient();

  if (!supabase || !code) {
    return NextResponse.redirect(new URL("/signin?error=callback_failed", request.url));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("Could not complete the Supabase email confirmation.", error);
    return NextResponse.redirect(new URL("/signin?error=callback_failed", request.url));
  }

  return NextResponse.redirect(new URL(nextPath, request.url));
}
