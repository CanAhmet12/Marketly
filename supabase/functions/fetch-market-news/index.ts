import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// News API sources
const NEWS_API_KEY = Deno.env.get('NEWS_API_KEY') || '';
const ALPHA_VANTAGE_KEY = Deno.env.get('ALPHA_VANTAGE_KEY') || '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching market news...');

    const newsItems: any[] = [];

    // Fetch from NewsAPI
    if (NEWS_API_KEY) {
      try {
        const newsApiUrl = `https://newsapi.org/v2/top-headlines?category=business&language=en&apiKey=${NEWS_API_KEY}`;
        const newsResponse = await fetch(newsApiUrl);
        const newsData = await newsResponse.json();

        if (newsData.articles) {
          for (const article of newsData.articles.slice(0, 20)) {
            newsItems.push({
              title: article.title,
              description: article.description,
              url: article.url,
              image_url: article.urlToImage,
              source: article.source.name,
              published_at: article.publishedAt,
              category: 'business',
              sentiment: 'neutral'
            });
          }
        }
      } catch (error) {
        console.error('NewsAPI fetch error:', error);
      }
    }

    // Fetch from Alpha Vantage Market News
    if (ALPHA_VANTAGE_KEY) {
      try {
        const avUrl = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=${ALPHA_VANTAGE_KEY}`;
        const avResponse = await fetch(avUrl);
        const avData = await avResponse.json();

        if (avData.feed) {
          for (const item of avData.feed.slice(0, 20)) {
            const symbols = item.ticker_sentiment?.map((t: any) => t.ticker) || [];
            
            newsItems.push({
              title: item.title,
              description: item.summary,
              url: item.url,
              image_url: item.banner_image,
              source: item.source,
              published_at: item.time_published,
              category: item.category_within_source,
              related_symbols: symbols,
              sentiment: item.overall_sentiment_label?.toLowerCase() || 'neutral'
            });
          }
        }
      } catch (error) {
        console.error('Alpha Vantage fetch error:', error);
      }
    }

    // Fallback: Use RSS feeds if no API keys
    if (newsItems.length === 0) {
      try {
        const rssFeeds = [
          'https://www.investing.com/rss/news.rss',
          'https://www.marketwatch.com/rss/',
          'https://feeds.finance.yahoo.com/rss/2.0/headline'
        ];

        for (const feedUrl of rssFeeds.slice(0, 1)) {
          const response = await fetch(feedUrl);
          const text = await response.text();
          
          // Simple RSS parsing
          const itemMatches = text.matchAll(/<item>([\s\S]*?)<\/item>/g);
          for (const match of itemMatches) {
            const itemXml = match[1];
            const title = itemXml.match(/<title>(.*?)<\/title>/)?.[1] || '';
            const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || '';
            const description = itemXml.match(/<description>(.*?)<\/description>/)?.[1] || '';
            const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';

            if (title && link) {
              newsItems.push({
                title: title.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1'),
                description: description.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').replace(/<[^>]*>/g, ''),
                url: link,
                image_url: null,
                source: 'RSS Feed',
                published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
                category: 'market',
                sentiment: 'neutral'
              });
            }
          }
        }
      } catch (error) {
        console.error('RSS fetch error:', error);
      }
    }

    // Insert news into database
    let inserted = 0;
    for (const item of newsItems) {
      try {
        const { error: insertError } = await supabase
          .from('market_news')
          .upsert(item, {
            onConflict: 'url'
          });

        if (!insertError) inserted++;
      } catch (error) {
        console.error('Error inserting news item:', error);
      }
    }

    console.log(`News fetch complete: ${inserted} items inserted`);

    await supabase.from('job_runs').insert({
      job_name: 'fetch-market-news',
      status: 'success',
      finished_at: new Date().toISOString(),
      rows_processed: inserted,
      metadata: { fetched: newsItems.length },
    }).then(() => {}).catch(() => {});

    return new Response(
      JSON.stringify({
        success: true,
        fetched: newsItems.length,
        inserted
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Fetch market news error:', error);
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from('job_runs').insert({
        job_name: 'fetch-market-news',
        status: 'error',
        finished_at: new Date().toISOString(),
        error_message: error.message || 'Internal server error',
      });
    } catch (_) { /* job_runs table may not exist yet */ }
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
