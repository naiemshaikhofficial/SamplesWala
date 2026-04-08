# Migrating Cron Jobs to Cloudflare Workers

Since you've shifted to Cloudflare and are facing Vercel Hobby plan limitations (once-per-day limit), we can use a **Cloudflare Worker Cron Trigger** to trigger your cleanup and renewal logic at any frequency (e.g., every hour).

## 1. Cloudflare Worker Script
Create a new Cloudflare Worker (e.g., `samples-wala-cron`) with the following logic:

```javascript
export default {
  async scheduled(event, env, ctx) {
    const endpoints = [
      '/api/cron/cleanup',
      '/api/cron/renew'
    ];

    const results = await Promise.all(endpoints.map(async (path) => {
      const url = `${env.NEXT_PUBLIC_SITE_URL}${path}`;
      console.log(`[SCHEDULED] Triggering ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${env.CRON_SECRET}`,
          'User-Agent': 'SamplesWala-Cloudflare-Cron'
        }
      });

      return { path, status: response.status, ok: response.ok };
    }));

    console.log('[CRON_SUMMARY]', results);
  },

  // Also allows manual triggering via URL for testing
  async fetch(request, env, ctx) {
    if (request.headers.get('Authorization') !== `Bearer ${env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }
    await this.scheduled(null, env, ctx);
    return new Response('Cron Triggered Manually');
  }
};
```

## 2. Configuration (Cloudflare Dashboard)
1. **Secrets**: Add the following Environment Variables in the Cloudflare Worker settings:
   - `NEXT_PUBLIC_SITE_URL`: `https://samples-wala.vercel.app` (or your custom domain)
   - `CRON_SECRET`: `SamplesWalaSecureLock2026` (Must match your `.env.local`)

2. **Triggers**: 
   - Add a **Cron Trigger** (e.g., `0 * * * *` for every hour).

## 3. Benefits
- **Higher Frequency**: Run cleanup every hour or every 10 minutes (Vercel Hobby is limited to 1x/day).
- **Reduced Egress**: Since your audio is already on Cloudflare, keeping the cron triggers there centralizes your autonomous logic.
- **Fail-Safe**: If Vercel functions timeout, Cloudflare will log the retry/failure clearly.
