import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, X, CreditCard, Banknote, Smartphone, DollarSign, Mic, MicOff } from 'lucide-react'
import { parseExpenseInput } from '@/utils/parseExpense'
import { formatCurrency } from '@/utils/formatters'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import type { PaymentMethod } from '@/types'

interface ExpenseInputProps {
  autoFocus?: boolean
  onSuccess?: () => void
  className?: string
  size?: 'default' | 'large'
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

const paymentIcons: Record<PaymentMethod, typeof CreditCard> = {
  credit: CreditCard,
  debit: Banknote,
  cash: DollarSign,
  pix: Smartphone,
}

export function ExpenseInput({ autoFocus = false, onSuccess, className, size = 'default' }: ExpenseInputProps) {
  const [input, setInput] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const addTransaction = useStore((s) => s.addTransaction)
  const accounts = useStore((s) => s.accounts)
  const creditCards = useStore((s) => s.creditCards)
  const { t, locale } = useI18n()

  const parsed = input ? parseExpenseInput(input, locale) : null

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.interimResults = false
    recognition.lang = locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-ES' : locale === 'fr' ? 'fr-FR' : 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      if (transcript) {
        setInput(transcript)
        setShowConfirm(false)
      }
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.abort()
    }
  }, [locale])

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleVoiceInput = useCallback(() => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.abort()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
    }
  }, [isListening])

  const handleSubmit = useCallback(() => {
    if (!parsed) return

    const defaultAccount = accounts[0]
    const defaultCard = creditCards[0]

    addTransaction({
      amount: parsed.amount,
      type: parsed.type,
      category: parsed.category,
      description: parsed.description,
      date: new Date().toISOString(),
      paymentMethod: parsed.paymentMethod,
      accountId: parsed.paymentMethod !== 'credit' ? defaultAccount?.id : undefined,
      creditCardId: parsed.paymentMethod === 'credit' ? defaultCard?.id : undefined,
      status: 'pending',
      isRecurring: false,
    })

    setInput('')
    setShowConfirm(false)
    onSuccess?.()
  }, [parsed, accounts, creditCards, addTransaction, onSuccess])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && parsed) {
      if (showConfirm) {
        handleSubmit()
      } else {
        setShowConfirm(true)
      }
    }
    if (e.key === 'Escape') {
      if (showConfirm) {
        setShowConfirm(false)
      } else {
        setInput('')
      }
    }
  }

  const isLarge = size === 'large'
  const categoryLabel = parsed ? t.categories[parsed.category as keyof typeof t.categories] || parsed.category : null
  const categoryColor = parsed ? getCategoryColor(parsed.category) : null
  const PaymentIcon = parsed ? paymentIcons[parsed.paymentMethod] : null
  const paymentLabel = parsed ? t.paymentMethods[parsed.paymentMethod as keyof typeof t.paymentMethods] : null

  return (
    <div className={cn('w-full max-w-lg mx-auto', className)}>
      <div className={cn(
        'relative flex items-center gap-2 rounded-2xl border bg-card transition-all',
        parsed && 'border-primary/50 shadow-[0_0_0_1px_hsl(var(--primary)/0.1)]',
        isLarge ? 'px-5 py-4' : 'px-4 py-3'
      )}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowConfirm(false) }}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? t.common.listening : t.quickAdd.placeholder}
          className={cn(
            'flex-1 bg-transparent outline-none placeholder:text-muted-foreground/60',
            isLarge ? 'text-lg' : 'text-sm'
          )}
        />
        {recognitionRef.current && (
          <button
            onClick={handleVoiceInput}
            className={cn(
              'p-1 rounded-full transition-colors',
              isListening
                ? 'text-red-500 hover:text-red-600'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            title={isListening ? 'Stop listening' : 'Voice input'}
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
        )}
        {input && (
          <button
            onClick={() => { setInput(''); setShowConfirm(false) }}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {parsed && (
          <button
            onClick={() => showConfirm ? handleSubmit() : setShowConfirm(true)}
            className={cn(
              'p-2 rounded-xl transition-all',
              showConfirm
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </div>

      {parsed && (
        <div className={cn(
          'mt-3 rounded-xl border bg-card/50 p-4 animate-slide-in',
          showConfirm && 'border-green-500/30 bg-green-500/5'
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: categoryColor || '#6b7280' }}
              >
                {parsed.category[0].toUpperCase()}
              </div>
              <div>
                <p className="font-medium capitalize">{parsed.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{categoryLabel}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    {PaymentIcon && <PaymentIcon className="h-3 w-3" />}
                    {paymentLabel}
                  </span>
                </div>
              </div>
            </div>
            <span className="text-lg font-bold text-destructive">
              -{formatCurrency(parsed.amount, locale)}
            </span>
          </div>
          {showConfirm && (
            <p className="text-xs text-green-500 mt-2 text-center animate-fade-in">
              {t.quickAdd.confirmHint}
            </p>
          )}
        </div>
      )}

      {!parsed && !input && (
        <p className={cn(
          'text-center text-muted-foreground mt-3',
          isLarge ? 'text-sm' : 'text-xs'
        )}>
          {t.quickAdd.formatHint}
        </p>
      )}
    </div>
  )
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    food: '#f97316', groceries: '#22c55e', transport: '#3b82f6', health: '#ef4444',
    entertainment: '#8b5cf6', housing: '#06b6d4', shopping: '#ec4899', education: '#f59e0b',
    other: '#6b7280',
  }
  return colors[category] || '#6b7280'
}
