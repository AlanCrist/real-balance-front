export type BankName = 'nubank' | 'itau' | 'bradesco' | 'santander' | 'inter' | 'c6' | 'caixa' | 'other'

export const BANK_COLORS: Record<BankName, { name: string; primary: string; gradient: string }> = {
  nubank: {
    name: 'Nubank',
    primary: '#8B1538',
    gradient: 'linear-gradient(135deg, #8B1538 0%, #C60D5A 100%)',
  },
  itau: {
    name: 'Itaú',
    primary: '#ff6b35',
    gradient: 'linear-gradient(135deg, #ff6b35 0%, #d94a1a 100%)',
  },
  bradesco: {
    name: 'Bradesco',
    primary: '#ED1C24',
    gradient: 'linear-gradient(135deg, #ED1C24 0%, #C60D1C 100%)',
  },
  santander: {
    name: 'Santander',
    primary: '#EC1C24',
    gradient: 'linear-gradient(135deg, #EC1C24 0%, #B5161D 100%)',
  },
  inter: {
    name: 'Banco Inter',
    primary: '#FF6B00',
    gradient: 'linear-gradient(135deg, #FF6B00 0%, #D94A00 100%)',
  },
  c6: {
    name: 'C6 Bank',
    primary: '#000000',
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
  },
  caixa: {
    name: 'Caixa',
    primary: '#0066CC',
    gradient: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
  },
  other: {
    name: 'Other',
    primary: '#6b7280',
    gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
  },
}

export type NetworkName = 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard'

export const NETWORK_BADGES: Record<NetworkName, { name: string; color: string; bg: string }> = {
  visa: {
    name: 'Visa',
    color: '#1434CB',
    bg: '#E8F0FE',
  },
  mastercard: {
    name: 'Mastercard',
    color: '#EB001B',
    bg: '#FEE8EC',
  },
  elo: {
    name: 'Elo',
    color: '#EF3B39',
    bg: '#FEE8E7',
  },
  amex: {
    name: 'American Express',
    color: '#006FCF',
    bg: '#E8F4FB',
  },
  hipercard: {
    name: 'Hipercard',
    color: '#FF5E00',
    bg: '#FFE8D6',
  },
}

export function getBankColor(bankName: string): { name: string; primary: string; gradient: string } {
  const bank = Object.entries(BANK_COLORS).find(
    ([, value]) => value.name.toLowerCase() === bankName?.toLowerCase()
  )
  return bank ? bank[1] : BANK_COLORS.other
}

export function getNetworkBadge(network: NetworkName): { name: string; color: string; bg: string } {
  return NETWORK_BADGES[network] || NETWORK_BADGES.visa
}
