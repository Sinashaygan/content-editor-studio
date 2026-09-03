import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/shared/api/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // هدایت کاربر به صفحه مقصد پس از لاگین موفق
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // در صورت وجود خطا یا منقضی شدن کد، به لاگین ریدایرکت شود
  return NextResponse.redirect(`${origin}/login?error=auth_callback`);
}
