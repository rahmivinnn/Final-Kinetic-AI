/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/Kinetic-AI-Final' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Kinetic-AI-Final/' : '',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Tetap aktifkan type checking di development
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  images: {
    unoptimized: true,
    domains: ['localhost'],
  },
  // Enable React Strict Mode
  reactStrictMode: true,
  // Webpack 5 configuration
  webpack: (config, { isServer }) => {
    // Important: return the modified config
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error on build
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        // Add other Node.js modules to mock
        net: false,
        tls: false,
        dns: false,
        child_process: false,
      };
    }
    
    // Add rule to handle binary files
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });
    
    return config;
  },
  // Enable source maps in development
  productionBrowserSourceMaps: true,
  // Configure page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mjs'],
  // Configure compiler
  compiler: {
    // Enable styled-components support
    styledComponents: true,
  },
  // Configure headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
  // Enable experimental features
  experimental: {
    // Add any experimental features here if needed
  },
}

export default nextConfig