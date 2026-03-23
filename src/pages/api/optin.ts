import type { APIRoute } from 'astro';

/**
 * Simple in-memory rate limiter.
 * In production on Cloudflare Workers, this resets per isolate.
 * For stricter rate limiting, use Cloudflare KV or Durable Objects.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  entry.count += 1;
  return entry.count > 10;
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigins = [
    'https://www2.carlosvargas.com',
    'https://www.carlosvargas.com',
    'http://localhost:4321',
  ];

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
  }

  return headers;
}

export const OPTIONS: APIRoute = ({ request }) => {
  const origin = request.headers.get('origin');
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Rate limiting
  const ip = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';
  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again in a minute.' }),
      { status: 429, headers: corsHeaders },
    );
  }

  // Parse body
  let body: { name?: string; email?: string; tags?: string[] };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request body.' }),
      { status: 400, headers: corsHeaders },
    );
  }

  const { name, email, tags } = body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return new Response(
      JSON.stringify({ error: 'A valid email address is required.' }),
      { status: 400, headers: corsHeaders },
    );
  }

  // Proxy to ClickFunnels API
  const apiKey = import.meta.env.CLICKFUNNELS_API_KEY;
  const workspaceId = import.meta.env.CLICKFUNNELS_WORKSPACE_ID;

  if (!apiKey || !workspaceId) {
    // In development/mock mode, return success
    console.log('[optin] Mock mode — no ClickFunnels credentials configured.');
    console.log('[optin] Would create contact:', { name, email, tags });
    return new Response(
      JSON.stringify({ success: true, mock: true }),
      { status: 200, headers: corsHeaders },
    );
  }

  try {
    const cfResponse = await fetch(
      `https://api.clickfunnels.com/api/v2/workspaces/${workspaceId}/contacts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          contact: {
            email_address: email,
            first_name: name || '',
            tags: tags || [],
          },
        }),
      },
    );

    if (!cfResponse.ok) {
      const errorText = await cfResponse.text();
      console.error('[optin] ClickFunnels API error:', cfResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to process your request. Please try again.' }),
        { status: 502, headers: corsHeaders },
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: corsHeaders },
    );
  } catch (err) {
    console.error('[optin] Network error:', err);
    return new Response(
      JSON.stringify({ error: 'Service temporarily unavailable. Please try again.' }),
      { status: 503, headers: corsHeaders },
    );
  }
};
