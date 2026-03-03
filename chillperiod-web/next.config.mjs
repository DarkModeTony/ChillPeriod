/** @type {import('next').NextConfig} */
const nextConfig = {
  // SECURITY: Don't expose Next.js version in response headers
  poweredByHeader: false,

  // SECURITY: Additional security headers via Next.js config
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            // Allow self, inline styles (needed by Next.js), and common image/font CDNs
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",  // Next.js requires unsafe-eval in dev
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://nominatim.openstreetmap.org https://*.mongodb.net ws: wss:",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' }, // Just in case
    ],
  },
};

export default nextConfig;
