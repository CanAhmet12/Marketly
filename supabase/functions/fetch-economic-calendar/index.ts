import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Economic calendar ingest skeleton.
 * BLOCKED: Requires TRADING_ECONOMICS_KEY or similar — do not deploy dummy data.
 * Manual trigger: POST /functions/v1/fetch-economic-calendar
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const apiKey = Deno.env.get('TRADING_ECONOMICS_KEY') || Deno.env.get('FINNHUB_API_KEY') || '';

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        success: false,
        blocked: true,
        reason: 'TRADING_ECONOMICS_KEY or FINNHUB_API_KEY not configured',
        message: 'Table and WEB repository are ready; ingest blocked until API key is set.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const startedAt = Date.now();
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Placeholder: real provider integration goes here when API key is available.
    const inserted = 0;

    await supabase.from('job_runs').insert({
      job_name: 'fetch-economic-calendar',
      status: 'success',
      finished_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt,
      rows_processed: inserted,
      metadata: { blocked: false, provider: 'pending' },
    }).then(() => {}).catch(() => {});

    return new Response(
      JSON.stringify({ success: true, inserted, note: 'Provider wiring pending product decision' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    await supabase.from('job_runs').insert({
      job_name: 'fetch-economic-calendar',
      status: 'error',
      finished_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt,
      error_message: msg,
    }).then(() => {}).catch(() => {});

    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
