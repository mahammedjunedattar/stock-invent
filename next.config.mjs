/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      webpackBuildWorker: true,
      optimizePackageImports: ['@heroicons/react'],
    },
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
  