/** @type {import('next').NextConfig} */

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'

let backendOrigin = 'http://localhost:8080'
try {
  backendOrigin = new URL(apiUrl.trim()).origin
} catch (e) {
  if (apiUrl.startsWith('http')) {
    const match = apiUrl.match(/^https?:\/\/[^\/]+/)
    if (match) backendOrigin = match[0]
  }
}

const nextConfig = {
  transpilePackages: ['mapbox-gl'],
  async rewrites() {
    return [
      {
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
      {
        protocol: 'https',
        hostname: 'divljjsnorvkrgcznwlh.supabase.co',
        pathname: '/**',
      },
      ...(() => {
        try {
          const u = new URL(backendOrigin)
          const pattern = {
            protocol: u.protocol.replace(':', ''),
            hostname: u.hostname,
            pathname: '/**',
          }
          if (u.port) pattern.port = u.port
          return [pattern]
        } catch {
          return [
            {
              protocol: 'http',
              hostname: 'localhost',
              port: '8080',
              pathname: '/**',
            },
          ]
        }
      })(),
    ],
  },
}

export default nextConfig
