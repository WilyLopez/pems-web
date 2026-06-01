import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: (failureCount, error: unknown) => {
        const apiError = error as { status?: number; codigoError?: string }
        if (apiError?.status === 401 || apiError?.status === 403 || apiError?.status === 404) return false
        if (apiError?.codigoError === 'SESSION_EXPIRED') return false
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})
