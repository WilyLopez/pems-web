export const siteConfig = {
  name: 'Kiki y Lala',
  description: 'Zona de diversión para niños — reservas, eventos y más',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  locale: 'es-PE',
  currency: 'PEN',
  brand: {
    rosa: '#F64B8A',
    azul: '#00AEEF',
    amarillo: '#FFD84D',
    menta: '#6EE7B7',
  },
  contact: {
    defaultPhone: '',
    defaultEmail: '',
  },
  socials: {
    facebook: '',
    instagram: '',
    tiktok: '',
  },
} as const
