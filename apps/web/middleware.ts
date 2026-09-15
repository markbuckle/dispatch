import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseEnv } from './lib/supabase/env';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Refreshes the auth token; do not remove, and do not run logic between this call and returning response
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthOnlyRoute = pathname === '/login' || pathname === '/signup';

  if (!user && pathname.startsWith('/dashboard')) {
    return redirectWithRefreshedCookies('/login', request, response);
  }

  if (user && isAuthOnlyRoute) {
    return redirectWithRefreshedCookies('/dashboard', request, response);
  }

  return response;
}

// NextResponse.redirect creates a new response, so the session cookies the
// call above just refreshed have to be copied over or the refresh is lost
function redirectWithRefreshedCookies(
  path: string,
  request: NextRequest,
  refreshedResponse: NextResponse,
) {
  const redirectResponse = NextResponse.redirect(new URL(path, request.url));
  for (const cookie of refreshedResponse.cookies.getAll()) {
    redirectResponse.cookies.set(cookie);
  }
  return redirectResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
