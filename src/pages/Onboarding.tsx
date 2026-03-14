import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, DollarSign, CreditCard, Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function Onboarding() {
  const navigate = useNavigate()
  const setOnboarding = useStore((s) => s.setOnboarding)
  const completeOnboarding = useStore((s) => s.completeOnboarding)
  const addAccount = useStore((s) => s.addAccount)
  const addCreditCard = useStore((s) => s.addCreditCard)
  const { t } = useI18n()

  const [step, setStep] = useState(0)
  const [income, setIncome] = useState('')
  const [creditLimit, setCreditLimit] = useState('')
  const [accountName, setAccountName] = useState('')
  const [accountBalance, setAccountBalance] = useState('')

  const steps = [
    {
      icon: DollarSign,
      title: t.onboarding.monthlyIncome,
      description: t.onboarding.monthlyIncomeDesc,
    },
    {
      icon: CreditCard,
      title: t.onboarding.creditCard,
      description: t.onboarding.creditCardDesc,
    },
    {
      icon: Building2,
      title: t.onboarding.bankAccount,
      description: t.onboarding.bankAccountDesc,
    },
  ]

  const handleNext = () => {
    if (step === 0) {
      setOnboarding({ monthlyIncome: parseFloat(income) || 0 })
      setStep(1)
    } else if (step === 1) {
      const limit = parseFloat(creditLimit)
      if (limit > 0) {
        setOnboarding({ creditCardLimit: limit })
        addCreditCard({
          name: 'My Card',
          limit,
          used: 0,
          closingDay: 25,
          dueDay: 5,
          color: '#3b82f6',
        })
      }
      setStep(2)
    } else {
      const balance = parseFloat(accountBalance)
      if (accountName && !isNaN(balance)) {
        addAccount({
          name: accountName,
          type: 'bank',
          balance,
          color: '#3b82f6',
          icon: 'Building2',
        })
      }
      completeOnboarding()
      navigate('/')
    }
  }

  const currentStep = steps[step]
  const Icon = currentStep.icon

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            {t.common.appName}
          </h1>
          <p className="text-muted-foreground mt-2">{t.onboarding.setupTitle}</p>
          <div className="mt-3 flex justify-center">
            <LanguageSwitcher variant="compact" />
          </div>
        </div>

        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-primary' : 'bg-secondary'
              }`}
            />
          ))}
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{currentStep.title}</h2>
                <p className="text-sm text-muted-foreground">{currentStep.description}</p>
              </div>
            </div>

            {step === 0 && (
              <Input
                type="number"
                placeholder="e.g. 3500"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="text-lg h-12"
                autoFocus
              />
            )}

            {step === 1 && (
              <Input
                type="number"
                placeholder="e.g. 5000"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                className="text-lg h-12"
                autoFocus
              />
            )}

            {step === 2 && (
              <div className="space-y-3">
                <Input
                  placeholder={t.onboarding.accountName}
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="h-12"
                  autoFocus
                />
                <Input
                  type="number"
                  placeholder={t.onboarding.currentBalance}
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(e.target.value)}
                  className="h-12"
                />
              </div>
            )}

            <Button onClick={handleNext} className="w-full h-11 gap-2">
              {step < 2 ? t.common.continue : t.common.getStarted}
              <ArrowRight className="h-4 w-4" />
            </Button>

            {step < 2 && (
              <button
                onClick={() => {
                  completeOnboarding()
                  navigate('/')
                }}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.common.skip}
              </button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
