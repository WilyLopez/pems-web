/** @type {import('next').NextConfig} */

// Derive the backend origin from the API URL so this config stays DRY.
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'
const backendOrigin = new URL(apiUrl).origin   // e.g. "http://localhost:8080"

const nextConfig = {
  async rewrites() {
    return [
      {
        // Proxy every /files/** request to the Spring Boot static-file endpoint.
        // This avoids 404s (Next.js has no /files handler) and avoids the
        // "private IP" block in the Next.js image optimizer.
        source: '/files/:path*',
        destination: `${backendOrigin}/files/:path*`,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      // Keep localhost:8080 for any remaining absolute-URL usages during migration.
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
