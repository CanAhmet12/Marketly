/**
 * Supabase Edge Function: ai-chat
 * OpenAI gpt-4o-mini ile finansal AI asistanı
 *
 * Deploy: supabase functions deploy ai-chat --project-ref YOUR_PROJECT_REF
 * Env: OPENAI_API_KEY (Supabase Dashboard → Settings → Edge Functions → Secrets)
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Sen Marketly uygulamasının AI finansal asistanısın. Adın "MarketAI".

Görevin:
- Türkçe finansal sorulara cevap vermek (kripto, hisse, döviz, emtia)
- Teknik analiz, temel analiz ve piyasa yorumları yapmak
- Portföy stratejisi ve risk yönetimi tavsiyeleri vermek
- Piyasa trendleri ve makroekonomik değerlendirmeler yapmak

Kurallar:
- Daima Türkçe yanıt ver
- Yanıtları markdown formatında düzenle (**kalın**, • liste, vs.)
- Yanıtlar 150-300 kelime arası olsun (çok uzun yazma)
- Her zaman "Bu bir yatırım tavsiyesi değildir" notunu ekle
- Anlık fiyat vermekten kaçın (veriler değişkendir)
- Güven skorunu 1-5 yıldız ile belirt

Mevcut piyasa bağlamı: {CONTEXT}`;

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const { messages, context } = await req.json();

    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      return new Response(
        JSON.stringify({ reply: 'AI servisi şu an aktif değil. Lütfen daha sonra tekrar deneyin.' }),
        { headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }

    const systemMessage = SYSTEM_PROMPT.replace('{CONTEXT}', context ?? 'Güncel piyasa verisi yok');

    const openAIRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        model:       'gpt-4o-mini',
        temperature: 0.7,
        max_tokens:  600,
        messages:    [
          { role: 'system', content: systemMessage },
          ...(messages ?? []).slice(-8), // Son 8 mesaj (bağlam limiti)
        ],
      }),
    });

    if (!openAIRes.ok) {
      const errText = await openAIRes.text();
      console.error('OpenAI error:', errText);
      throw new Error('OpenAI API hatası');
    }

    const openAIData = await openAIRes.json();
    const reply = openAIData.choices?.[0]?.message?.content ?? 'Yanıt alınamadı.';

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[ai-chat]', err);
    return new Response(
      JSON.stringify({ error: String(err), reply: 'Bir hata oluştu. Lütfen tekrar deneyin.' }),
      {
        status: 500,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      }
    );
  }
});
