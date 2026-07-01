import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { getLoginConfirmationEmailHTML, getLoginConfirmationEmailText } from '@/lib/auth/email-templates';

export async function POST(request: NextRequest) {
  try {
    const { userId, email, deviceName, ipAddress } = await request.json();

    // Validate input
    if (!userId || !email || !deviceName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user's full name from profiles table
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            );
          },
        },
      }
    );

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle();

    const fullName = profile?.full_name || 'User';
    const timestamp = new Date().toISOString();

    // Send email via Supabase Auth (uses configured email provider)
    const { error: emailError } = await supabase.auth.admin.sendRawEmail({
      to: email,
      subject: '🔐 New login to CricNet detected',
      html: getLoginConfirmationEmailHTML({
        email,
        fullName,
        deviceName,
        timestamp,
        ipAddress,
      }),
      text: getLoginConfirmationEmailText({
        email,
        fullName,
        deviceName,
        timestamp,
        ipAddress,
      }),
    });

    if (emailError) {
      console.error('Error sending login confirmation email:', emailError);
      // Log but don't fail the request - login should succeed even if email fails
      return NextResponse.json(
        { warning: 'Login successful but email notification failed' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Login confirmation email sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in send-login-confirmation:', error);
    // Don't expose internal errors to client
    return NextResponse.json(
      { error: 'Failed to send confirmation email' },
      { status: 500 }
    );
  }
}
