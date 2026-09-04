import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/shared/api/supabase";

const PUBLIC_ROUTES = ["/login", "/register", "/auth"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets must remain public; otherwise unauthenticated requests for
  // CSS/JS are redirected to /login and the page renders as unstyled HTML.
  if (
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/favicon/")
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // استفاده از getUser برای اعتبارسنجی سروری JWT
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = PUBLIC_ROUTES.some((p) => pathname.startsWith(p));

  // ریدایرکت کاربر لاگین‌نکرده
  if (!user && !isPublic) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }
  return response;
}
