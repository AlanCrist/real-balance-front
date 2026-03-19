export type BankName = 'nubank' | 'itau' | 'bradesco' | 'santander' | 'inter' | 'c6' | 'caixa' | 'other'

export interface BankStyle {
  name: string
  primary: string
  gradient: string
  overlay: string
  text: string
  accent?: string
}

export const BANK_COLORS: Record<BankName, BankStyle> = {
  nubank: {
    name: 'Nubank',
    primary: '#820AD1',
    gradient: 'linear-gradient(135deg, #820AD1 0%, #5A05A0 100%)',
    overlay: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 40%, rgba(0,0,0,0.25) 100%)',
    text: '#FFFFFF',
  },
  itau: {
    name: 'Itaú',
    primary: '#FF6200',
    gradient: 'linear-gradient(135deg, #FF6200 0%, #CC4E00 100%)',
    overlay: 'linear-gradient(120deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.08) 40%, rgba(0,0,0,0.25) 100%)',
    text: '#FFFFFF',
  },
  bradesco: {
    name: 'Bradesco',
    primary: '#ED1C24',
    gradient: 'linear-gradient(135deg, #ED1C24 0%, #A3151B 100%)',
    overlay: 'linear-gradient(120deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.3) 100%)',
    text: '#FFFFFF',
  },
  santander: {
    name: 'Santander',
    primary: '#EC0000',
    gradient: 'linear-gradient(135deg, #EC0000 0%, #A80000 100%)',
    overlay: 'linear-gradient(120deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.3) 100%)',
    text: '#FFFFFF',
  },
  inter: {
    name: 'Banco Inter',
    primary: '#FF7A00',
    gradient: 'linear-gradient(135deg, #FF7A00 0%, #CC5F00 100%)',
    overlay: 'linear-gradient(120deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.08) 40%, rgba(0,0,0,0.25) 100%)',
    text: '#FFFFFF',
  },
  c6: {
    name: 'C6 Bank',
    primary: '#000000',
    gradient: 'linear-gradient(135deg, #000000 0%, #2B2B2B 100%)',
    overlay: 'linear-gradient(120deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0.4) 100%)',
    text: '#FFFFFF',
    accent: '#C9A961',
  },
  caixa: {
    name: 'Caixa',
    primary: '#0070D2',
    gradient: 'linear-gradient(135deg, #0070D2 0%, #005CA8 100%)',
    overlay: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.07) 40%, rgba(0,0,0,0.25) 100%)',
    text: '#FFFFFF',
  },
  other: {
    name: 'Other',
    primary: '#6B7280',
    gradient: 'linear-gradient(135deg, #6B7280 0%, #374151 100%)',
    overlay: 'linear-gradient(120deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.25) 100%)',
    text: '#FFFFFF',
  },
}

export type NetworkName = 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard'

export interface NetworkStyle {
  name: string
  color: string
  bg: string
  gradient: string
  text: string
  icon: string
}

export const NETWORK_BADGES: Record<NetworkName, NetworkStyle> = {
  visa: {
    name: 'Visa',
    color: '#1A1F71',
    bg: '#E6ECFF',
    gradient: 'linear-gradient(135deg, #1A1F71 0%, #1434CB 100%)',
    text: '#FFFFFF',
    icon: 'https://cdn.simpleicons.org/visa/ffffff',
  },
  mastercard: {
    name: 'Mastercard',
    color: '#EB001B',
    bg: '#FFF1F2',
    gradient: 'linear-gradient(135deg, #EB001B 0%, #F79E1B 100%)',
    text: '#FFFFFF',
    icon: 'https://cdn.simpleicons.org/mastercard/ffffff',
  },
  elo: {
    name: 'Elo',
    color: '#000000',
    bg: '#F3F4F6',
    gradient: 'linear-gradient(135deg, #000000 0%, #3A3A3A 100%)',
    text: '#FFFFFF',
    icon: 'https://logodownload.org/wp-content/uploads/2017/04/elo-logo-1.png',
  },
  amex: {
    name: 'American Express',
    color: '#2E77BC',
    bg: '#EAF4FF',
    gradient: 'linear-gradient(135deg, #2E77BC 0%, #006FCF 100%)',
    text: '#FFFFFF',
    icon: 'https://cdn.simpleicons.org/americanexpress/ffffff',
  },
  hipercard: {
    name: 'Hipercard',
    color: '#FF6A00',
    bg: '#FFF4E6',
    gradient: 'linear-gradient(135deg, #FF6A00 0%, #E65100 100%)',
    text: '#FFFFFF',
    icon: 'https://logodownload.org/wp-content/uploads/2017/04/hipercard-logo.png',
  },
}

export function getBankColor(bankName: string): BankStyle {
  const bank = Object.entries(BANK_COLORS).find(
    ([, value]) => value.name.toLowerCase() === bankName?.toLowerCase()
  )
  return bank ? bank[1] : BANK_COLORS.other
}

export function getNetworkBadge(network: NetworkName): NetworkStyle {
  return NETWORK_BADGES[network] || NETWORK_BADGES.visa
}
