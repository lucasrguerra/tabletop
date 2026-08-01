/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emits .next/standalone with only the dependencies the app actually
  // reaches, instead of shipping the whole node_modules tree in the image.
  // The custom server (server.mjs) and its own dependencies are not traced by
  // Next, so the Dockerfile supplies them separately.
  output: 'standalone',

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
