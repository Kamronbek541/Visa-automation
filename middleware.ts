// import createMiddleware from 'next-intl/middleware';

// export default createMiddleware({
//   locales: ['en', 'ru', 'uz'],
//   defaultLocale: 'en'
// });

// export const config = {
//   matcher: ['/', '/(ru|uz|en)/:path*']
// };

import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ru', 'uz'],
  defaultLocale: 'en'
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};