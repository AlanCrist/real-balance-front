import { useState } from 'react'
import {
  Building2,
  Banknote,
  Smartphone,
  Wallet,
  Plus,
  Trash2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/lib/utils'
import type { AccountType } from '@/types'

export function Accounts() {
  const accounts = useStore((s) => s.accounts)
  const addAccount = useStore((s) => s.addAccount)
  const removeAccount = useStore((s) => s.removeAccount)
  const getTotalBalance = useStore((s) => s.getTotalBalance)
  const { t, locale } = useI18n()

  const accountTypeConfig: Record<AccountType, { icon: typeof Building2; label: string; color: string }> = {
    bank: { icon: Building2, label: t.accounts.bankAccount, color: '#3b82f6' },
    cash: { icon: Banknote, label: t.accounts.cash, color: '#22c55e' },
    wallet: { icon: Wallet, label: t.accounts.wallet, color: '#f59e0b' },
    digital: { icon: Smartphone, label: t.accounts.digitalBank, color: '#8b5cf6' },
  }

  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<AccountType>('bank')
  const [newBalance, setNewBalance] = useState('')

  const handleAdd = () => {
    if (!newName || !newBalance) return
    const config = accountTypeConfig[newType]
    addAccount({
      name: newName,
      type: newType,
      balance: parseFloat(newBalance),
      color: config.color,
      icon: config.icon.name || 'Wallet',
    })
    setNewName('')
    setNewType('bank')
    setNewBalance('')
    setOpen(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.accounts.title}</h1>
          <p className="text-sm text-muted-foreground">{t.accounts.subtitle}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              {t.accounts.addAccount}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.accounts.newAccount}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t.accounts.name}</label>
                <Input
                  placeholder={t.accounts.namePlaceholder}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t.accounts.type}</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(accountTypeConfig) as [AccountType, typeof accountTypeConfig.bank][]).map(
                    ([type, config]) => (
                      <button
                        key={type}
                        onClick={() => setNewType(type)}
                        className={cn(
                          'flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors',
                          newType === type
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'hover:bg-accent'
                        )}
                      >
                        <config.icon className="h-4 w-4" />
                        {config.label}
                      </button>
                    )
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t.accounts.balance}</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                />
              </div>
              <Button onClick={handleAdd} className="w-full">
                {t.accounts.addAccount}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-1">{t.accounts.totalBalance}</p>
          <p className="text-3xl font-bold">{formatCurrency(getTotalBalance(), locale)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t.accounts.acrossAccounts.replace('{count}', String(accounts.length))}
          </p>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-3">
        {accounts.map((account) => {
          const config = accountTypeConfig[account.type]
          const Icon = config.icon

          return (
            <Card key={account.id} className="group overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: account.color + '20', color: account.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-xs text-muted-foreground">{config.label}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeAccount(account.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4">
                  <p className={cn('text-2xl font-bold', account.balance >= 0 ? 'text-green-500' : 'text-destructive')}>
                    {formatCurrency(account.balance, locale)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
