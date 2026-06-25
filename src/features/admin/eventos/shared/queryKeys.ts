export const eventosKeys = {
  all: ['eventos'] as const,
  lists: () => [...eventosKeys.all, 'list'] as const,
  list: (params: object) => [...eventosKeys.lists(), params] as const,
  details: () => [...eventosKeys.all, 'detail'] as const,
  detail: (id: number) => [...eventosKeys.details(), id] as const,
  checklist: (id: number) => [...eventosKeys.all, 'checklist', id] as const,
} as const
