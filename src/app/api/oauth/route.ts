import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  const client_id = process.env.OAUTH_CLIENT_ID!;
  const client_secret = process.env.BLOGGER_CLIENT_SECRET!;
  const redirect_uri = 'https://auto-blog-tau.vercel.app/api/oauth';

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id,
      client_secret,
      redirect_uri,
      grant_type: 'authorization_code',
    }),
  });

  const data = await tokenRes.json();

  if (!tokenRes.ok) {
    return NextResponse.json({ error: data }, { status: tokenRes.status });
  }

  return NextResponse.json({
    message: 'Tokens received!',
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    scope: data.scope,
    token_type: data.token_type,
  });
}
