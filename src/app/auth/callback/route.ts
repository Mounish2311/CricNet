import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { generateDeviceFingerprint, parseDeviceName, checkAndRecordLoginSession } from '@/lib/auth/login-session';

// OAuth (and email-link) callback: Supabase redirects here with a `code`.
// We exchange it for a session, then route based on whether the user has
// already completed onboarding (picked a role / created a profile row).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // No code means the provider returned an error or the link was malformed.
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  // Build the redirect up front so the SSR client can attach refreshed session
  // cookies to it. We rewrite its `location` once we know the destination.
  const response = NextResponse.redirect(`${origin}/login`);
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  // Extract device info for login session tracking
  const userAgent = request.headers.get('user-agent') || '';
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
  const deviceFingerprint = generateDeviceFingerprint(userAgent, ipAddress);
  const deviceName = parseDeviceName(userAgent);

  // Check if this is a new device and send confirmation email if needed
  const sessionResult = await checkAndRecordLoginSession(data.user.id, {
    fingerprint: deviceFingerprint,
    userAgent,
    ipAddress,
    deviceName,
  }, supabase);

  // Log new device login for security tracking
  if (sessionResult.isNewDevice) {
    console.log(`New device login: ${data.user.email} from ${sessionResult.deviceName}`);
    // Send confirmation email via Resend
    try {
      await fetch(`${origin}/api/auth/send-login-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: data.user.id,
          email: data.user.email,
          deviceName: sessionResult.deviceName,
          ipAddress,
        }),
      });
    } catch (err) {
      console.error('Failed to send login confirmation email:', err);
      // Don't block login if email sending fails
    }
  }

  // Onboarded users go straight in; everyone else picks a role first.
  // We check the actual profile row (source of truth) rather than metadata.
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', data.user.id)
    .maybeSingle();

  const destination = profile ? '/talent' : '/onboarding';
  // Rewrite the redirect target on the response that carries the session
  // cookies, rather than building a second redirect (which would conflict).
  response.headers.set('location', `${origin}${destination}`);
  return response;
}
