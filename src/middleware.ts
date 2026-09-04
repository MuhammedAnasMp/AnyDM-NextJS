import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Root domain configured via environment variable (default: zoyee.in)
  // Supports switching main domain (e.g., from zoyee.in to anydm.in) without code modifications.
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'zoyee.in').toLowerCase().trim();

  // Extract hostname without port
  const currentHost = hostname.split(':')[0].toLowerCase();
  const rootHost = rootDomain.split(':')[0].toLowerCase();

  // Exclude static assets, internal paths
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const RESERVED_SUBDOMAINS = ['api', 'app', 'www', 'admin', 'cdn', 'assets', 'static', 'mail', 'auth'];

  // Handle api subdomain (e.g. api.zoyee.in or api.anydm.in)
  if (currentHost === `api.${rootHost}`) {
    if (url.pathname === '/' || url.pathname === '') {
      return NextResponse.json({ status: 'ok' });
    }
  }

  // Main system domains / local environments
  const isAppHost =
    currentHost === `app.${rootHost}` ||
    currentHost === `api.${rootHost}` ||
    currentHost === rootHost ||
    currentHost === 'localhost' ||
    currentHost === '127.0.0.1';

  if (!isAppHost) {
    // 1. Subdomain of root domain (e.g., my_muscles_factory.zoyee.in)
    if (currentHost.endsWith(`.${rootHost}`)) {
      const subdomain = currentHost.replace(`.${rootHost}`, '');
      if (subdomain && !RESERVED_SUBDOMAINS.includes(subdomain)) {
        url.pathname = `/${subdomain}${url.pathname}`;
        return NextResponse.rewrite(url);
      }
    } else {
      // 2. Custom Domain (e.g., my_muscles_factory.in or www.my_muscles_factory.in)
      const cleanCustomDomain = currentHost.replace(/^www\./, '');
      url.pathname = `/${cleanCustomDomain}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
