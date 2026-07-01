import { createServerClient, type CookieOptions } from '@supabase/ssr';
import crypto from 'crypto';

export interface DeviceInfo {
  fingerprint: string;
  userAgent: string;
  ipAddress: string;
  deviceName: string;
}

/**
 * Generate a device fingerprint from user agent and IP
 * Used to detect new devices/browsers
 */
export function generateDeviceFingerprint(userAgent: string, ipAddress: string): string {
  const combined = `${userAgent}-${ipAddress}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
}

/**
 * Parse user agent to extract device name
 * Returns readable device name like "Chrome on Windows", "Safari on iPhone", etc.
 */
export function parseDeviceName(userAgent: string): string {
  if (!userAgent) return 'Unknown device';

  // Browser detection
  let browser = 'Unknown browser';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  // OS detection
  let os = 'Unknown OS';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('iPhone')) os = 'iPhone';
  else if (userAgent.includes('iPad')) os = 'iPad';
  else if (userAgent.includes('Android')) os = 'Android';

  return `${browser} on ${os}`;
}

export interface LoginSessionResult {
  isNewDevice: boolean;
  deviceName: string;
}

/**
 * Check if device is new and store/update login session
 * Returns true if it's a new device (should send confirmation email)
 */
export async function checkAndRecordLoginSession(
  userId: string,
  deviceInfo: DeviceInfo,
  supabase: ReturnType<typeof createServerClient>
): Promise<LoginSessionResult> {
  try {
    // Check if this device already exists
    const { data: existingSession } = await supabase
      .from('login_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('device_fingerprint', deviceInfo.fingerprint)
      .maybeSingle();

    const isNewDevice = !existingSession;

    if (isNewDevice) {
      // Insert new session record
      await supabase.from('login_sessions').insert({
        user_id: userId,
        device_fingerprint: deviceInfo.fingerprint,
        ip_address: deviceInfo.ipAddress,
        user_agent: deviceInfo.userAgent,
        device_name: deviceInfo.deviceName,
      });
    } else {
      // Update last login time for existing device
      await supabase
        .from('login_sessions')
        .update({ last_login_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('device_fingerprint', deviceInfo.fingerprint);
    }

    return {
      isNewDevice,
      deviceName: deviceInfo.deviceName,
    };
  } catch (error) {
    console.error('Error recording login session:', error);
    // Don't throw - we don't want login to fail if session tracking fails
    return {
      isNewDevice: false,
      deviceName: deviceInfo.deviceName,
    };
  }
}
