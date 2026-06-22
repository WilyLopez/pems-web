export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL!,
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'Kiki y Lala',
  nextAuthUrl: process.env.NEXTAUTH_URL,
  nodeEnv: process.env.NODE_ENV,
  isProd: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV === 'development',
} as const
