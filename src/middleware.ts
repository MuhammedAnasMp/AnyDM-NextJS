import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Root domain configured via environment variable (default: zoyee.in)
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'zoyee.in').toLowerCase().trim();

  // Extract hostname without port
  const currentHost = hostname.split(':')[0].toLowerCase();
  const rootHost = rootDomain.split(':')[0].toLowerCase();

  const RESERVED_SUBDOMAINS = ['api', 'app', 'www', 'admin', 'cdn', 'assets', 'static', 'mail', 'auth'];

  // Handle api subdomain (e.g. api.zoyee.in or api.anydm.in)
  if (currentHost === `api.${rootHost}`) {
    if (url.pathname === '/' || url.pathname === '') {
      return NextResponse.json({ status: 'ok' });
    }
    // If request to api subdomain does not start with /api, prepend /api so it gets proxied to backend
    if (!url.pathname.startsWith('/api')) {
      url.pathname = `/api${url.pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Exclude static assets, internal paths, and API routes
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Main system domains / local environments
  const isAppHost =
    currentHost === `app.${rootHost}` ||
    currentHost === `api.${rootHost}` ||
    currentHost === rootHost ||
    currentHost === 'anydm.in' ||
    currentHost === 'www.anydm.in' ||
    currentHost === 'zoyee.in' ||
    currentHost === 'www.zoyee.in' ||
    currentHost === 'localhost' ||
    currentHost === '127.0.0.1' ||
    currentHost.endsWith('.vercel.app');

  // Redirect any legacy /track routes directly to /orders
  if (url.pathname.startsWith('/track')) {
    const newPath = url.pathname.replace(/^\/track/, '/orders');
    return NextResponse.redirect(new URL(newPath + url.search, request.url), 308);
  }

  if (!isAppHost) {
    let tenantSlug = '';
    if (currentHost.endsWith(`.${rootHost}`)) {
      const subdomain = currentHost.replace(`.${rootHost}`, '');
      if (subdomain && !RESERVED_SUBDOMAINS.includes(subdomain)) {
        tenantSlug = subdomain;
      }
    } else {
      // 2. Custom Domain (e.g. 12.com or www.12.com)
      tenantSlug = currentHost.replace(/^www\./, '');
    }

    if (tenantSlug) {
      // 1. If pathname exactly matches redundant tenant slug (e.g. /12 or /12/ or /12.com)
      if (url.pathname === `/${tenantSlug}` || url.pathname === `/${tenantSlug}/`) {
        return NextResponse.redirect(new URL('/' + url.search, request.url));
      }

      // 2. If pathname starts with redundant tenant slug (e.g. /12/product/123)
      if (url.pathname.startsWith(`/${tenantSlug}/`)) {
        const cleanPath = url.pathname.slice(tenantSlug.length + 1) || '/';
        return NextResponse.redirect(new URL(cleanPath + url.search, request.url));
      }

      // 3. For tenant domains (subdomains & custom domains), redirect redundant merchant username paths (e.g. /zoira_lawns on me1.zoyee.in) to store root /
      const pathParts = url.pathname.split('/').filter(Boolean);
      const firstSegment = pathParts[0];
      const KNOWN_STORE_PATHS = ['product', 'terms', 'privacy', 'orders', 'account', '_next', 'api', 'favicon.ico'];
      if (firstSegment && !KNOWN_STORE_PATHS.includes(firstSegment)) {
        const remainingPath = '/' + pathParts.slice(1).join('/');
        return NextResponse.redirect(new URL(remainingPath + url.search, request.url));
      }

      // 4. Clean rewrite: rewrite request to `/[tenantSlug]/...`
      url.pathname = `/${tenantSlug}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
