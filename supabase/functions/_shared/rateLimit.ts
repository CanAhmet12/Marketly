/**
 * Rate Limiting Middleware for Supabase Edge Functions
 * 
 * Usage in Edge Functions:
 * ```typescript
 * import { rateLimit } from '../_shared/rateLimit.ts';
 * 
 * Deno.serve(async (req) => {
 *   const userId = req.headers.get('x-user-id');
 *   if (!userId) {
 *     return new Response('Unauthorized', { status: 401 });
 *   }
 * 
 *   const rateLimitResult = await rateLimit(userId, 10, 60000); // 10 req/min
 *   if (!rateLimitResult.allowed) {
 *     return new Response(
 *       JSON.stringify({ error: 'Rate limit exceeded', retry_after: rateLimitResult.retryAfter }),
 *       { status: 429, headers: { 'Content-Type': 'application/json' } }
 *     );
 *   }
 * 
 *   // ... proceed with request
 * });
 * ```
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
}

/**
 * Check and enforce rate limit for a user
 * @param userId - User ID to check
 * @param limit - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Rate limit result
 */
export async function rateLimit(
  userId: string,
  limit: number = 10,
  windowMs: number = 60000
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - windowMs;

  try {
    // Get or create rate limit record
    const { data: record, error: fetchError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('endpoint', 'default')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Rate limit fetch error:', fetchError);
      return { allowed: true, remaining: limit };
    }

    if (!record) {
      // First request - create record
      const { error: insertError } = await supabase
        .from('rate_limits')
        .insert({
          user_id: userId,
          endpoint: 'default',
          request_count: 1,
          window_start: new Date(now).toISOString(),
        });

      if (insertError) {
        console.error('Rate limit insert error:', insertError);
        return { allowed: true, remaining: limit - 1 };
      }

      return { allowed: true, remaining: limit - 1 };
    }

    const recordWindowStart = new Date(record.window_start).getTime();

    // Check if window has expired
    if (recordWindowStart < windowStart) {
      // Reset window
      const { error: updateError } = await supabase
        .from('rate_limits')
        .update({
          request_count: 1,
          window_start: new Date(now).toISOString(),
        })
        .eq('user_id', userId)
        .eq('endpoint', 'default');

      if (updateError) {
        console.error('Rate limit reset error:', updateError);
      }

      return { allowed: true, remaining: limit - 1 };
    }

    // Check if limit exceeded
    if (record.request_count >= limit) {
      const retryAfter = Math.ceil((recordWindowStart + windowMs - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        retryAfter,
      };
    }

    // Increment counter
    const { error: updateError } = await supabase
      .from('rate_limits')
      .update({
        request_count: record.request_count + 1,
      })
      .eq('user_id', userId)
      .eq('endpoint', 'default');

    if (updateError) {
      console.error('Rate limit increment error:', updateError);
    }

    return {
      allowed: true,
      remaining: limit - (record.request_count + 1),
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    return { allowed: true, remaining: limit };
  }
}

/**
 * Endpoint-specific rate limiter
 */
export async function rateLimitEndpoint(
  userId: string,
  endpoint: string,
  limit: number = 10,
  windowMs: number = 60000
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - windowMs;

  try {
    const { data: record } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .single();

    if (!record) {
      await supabase.from('rate_limits').insert({
        user_id: userId,
        endpoint,
        request_count: 1,
        window_start: new Date(now).toISOString(),
      });
      return { allowed: true, remaining: limit - 1 };
    }

    const recordWindowStart = new Date(record.window_start).getTime();

    if (recordWindowStart < windowStart) {
      await supabase
        .from('rate_limits')
        .update({
          request_count: 1,
          window_start: new Date(now).toISOString(),
        })
        .eq('user_id', userId)
        .eq('endpoint', endpoint);
      return { allowed: true, remaining: limit - 1 };
    }

    if (record.request_count >= limit) {
      const retryAfter = Math.ceil((recordWindowStart + windowMs - now) / 1000);
      return { allowed: false, remaining: 0, retryAfter };
    }

    await supabase
      .from('rate_limits')
      .update({ request_count: record.request_count + 1 })
      .eq('user_id', userId)
      .eq('endpoint', endpoint);

    return { allowed: true, remaining: limit - (record.request_count + 1) };
  } catch (error) {
    console.error('Rate limit error:', error);
    return { allowed: true, remaining: limit };
  }
}
