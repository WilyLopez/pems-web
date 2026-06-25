export const contratosKeys = {
  all: ['contratos'] as const,
  lists: () => [...contratosKeys.all, 'list'] as const,
  list: (params: object) => [...contratosKeys.lists(), params] as const,
  details: () => [...contratosKeys.all, 'detail'] as const,
  detail: (id: number) => [...contratosKeys.details(), id] as const,
  porEvento: (idEvento: number) => [...contratosKeys.all, 'evento', idEvento] as const,
} as const
