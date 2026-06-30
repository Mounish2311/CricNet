import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  // getSession() reads the JWT from the cookie locally — no auth-server
  // round-trip on a valid token (it only hits the network when the token is
  // expired and needs refreshing, which we have to do anyway). getUser() would
  // validate against the auth server on EVERY navigation, adding a network
  // round-trip to every click. This is a redirect backstop, not a security
  // gate — real access control is enforced by RLS + server components — so the
  // locally-decoded claim is sufficient here.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  // Onboarding backstop: a signed-in user who hasn't picked a role yet (e.g. a
  // Google user who closed the tab on the callback) is funneled to /onboarding.
  // We read the `onboarded` flag from the JWT metadata — no DB round-trip here.
  // Auth routes, the onboarding page, and APIs are exempt to avoid redirect
  // loops and broken API calls.
  const { pathname } = request.nextUrl;
  const exempt =
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/api');
  if (user && !user.user_metadata?.onboarded && !exempt) {
    const url = request.nextUrl.clone();
    url.pathname = '/onboarding';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
