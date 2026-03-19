import { useState } from 'react'
import { Building2, Banknote, Smartphone, Wallet, Plus, Trash2, AlertTriangle, Edit2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const updateAccount = useStore((s) => s.updateAccount)
  const getTotalBalance = useStore((s) => s.getTotalBalance)
  const { t, locale } = useI18n()

  const accountTypeConfig: Record<AccountType, { icon: typeof Building2; label: string; color: string }> = {
    bank: { icon: Building2, label: t.accounts.bankAccount, color: '#3b82f6' },
    cash: { icon: Banknote, label: t.accounts.cash, color: '#22c55e' },
    wallet: { icon: Wallet, label: t.accounts.wallet, color: '#f59e0b' },
    digital: { icon: Smartphone, label: t.accounts.digitalBank, color: '#7c3aed' },
  }

  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<AccountType>('bank')
  const [newBalance, setNewBalance] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editBalance, setEditBalance] = useState('')

  const openEdit = (account: { id: string; name: string; balance: number }) => {
    setEditingId(account.id)
    setEditName(account.name)
    setEditBalance(String(account.balance))
  }

  const handleEdit = () => {
    if (!editingId || !editName) return
    updateAccount(editingId, { name: editName, balance: parseFloat(editBalance) || 0 })
    setEditingId(null)
  }

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

  const totalBalance = getTotalBalance()
  const isNegativeTotal = totalBalance < 0
  const isLowTotal = totalBalance < 200 && totalBalance >= 0

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.accounts.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t.accounts.subtitle}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 shadow-sm">
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
                <Input placeholder={t.accounts.namePlaceholder} value={newName} onChange={(e) => setNewName(e.target.value)} />
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
                          'flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all',
                          newType === type
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'hover:bg-accent border-border'
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
                <Input type="number" placeholder="0.00" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} />
              </div>
              <Button onClick={handleAdd} className="w-full">{t.accounts.addAccount}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Total Balance Hero */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={cn(
          'relative overflow-hidden border',
          isNegativeTotal && 'animate-pulse-danger border-red-400/50',
          isLowTotal && 'animate-pulse-warning border-amber-400/40',
          !isNegativeTotal && !isLowTotal && 'border-violet-500/20'
        )}>
          <div className={cn(
            'absolute inset-0 bg-gradient-to-br pointer-events-none',
            isNegativeTotal ? 'from-red-500/8' : isLowTotal ? 'from-amber-500/8' : 'from-violet-500/8',
            'via-transparent to-transparent'
          )} />
          <CardContent className="p-6 text-center relative z-10">
            {(isNegativeTotal || isLowTotal) && (
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <AlertTriangle className={cn('h-4 w-4', isNegativeTotal ? 'text-red-500' : 'text-amber-500')} />
                <span className={cn('text-xs font-semibold', isNegativeTotal ? 'text-red-500' : 'text-amber-600 dark:text-amber-400')}>
                  {isNegativeTotal ? t.accounts.negativeBalance : t.accounts.lowBalance}
                </span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mb-1">{t.accounts.totalBalance}</p>
            <p className={cn(
              'text-3xl font-bold tabular-nums',
              isNegativeTotal ? 'text-red-500' : isLowTotal ? 'text-amber-500' : 'text-foreground'
            )}>
              {formatCurrency(totalBalance, locale)}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">
              {t.accounts.acrossAccounts.replace('{count}', String(accounts.length))}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Cards */}
      <div className="grid sm:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {accounts.map((account, idx) => {
            const config = accountTypeConfig[account.type]
            const Icon = config.icon
            const isNegative = account.balance < 0
            const isLow = account.balance < 100 && account.balance >= 0

            return (
              <motion.div
                key={account.id}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
              >
                <Card className={cn(
                  'group overflow-hidden border transition-all',
                  isNegative && 'animate-pulse-danger border-red-400/40',
                  isLow && !isNegative && 'border-amber-400/30'
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: account.color + '20', color: account.color }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold">{account.name}</p>
                          <p className="text-xs text-muted-foreground">{config.label}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => openEdit(account)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeAccount(account.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className={cn(
                        'text-2xl font-bold tabular-nums',
                        isNegative ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-emerald-500'
                      )}>
                        {formatCurrency(account.balance, locale)}
                      </p>
                      {isLow && !isNegative && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> {t.accounts.lowBalance}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Edit Account Dialog */}
      <Dialog open={editingId !== null} onOpenChange={(o) => !o && setEditingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.accounts.editAccount}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t.accounts.name}</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t.accounts.balance}</label>
              <Input type="number" value={editBalance} onChange={(e) => setEditBalance(e.target.value)} />
            </div>
            <Button onClick={handleEdit} className="w-full">{t.accounts.saveChanges}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {accounts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 text-muted-foreground"
        >
          <div className="h-16 w-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
            <Wallet className="h-8 w-8 text-violet-400 opacity-60" />
          </div>
          <p className="font-semibold">{t.accounts.noAccounts}</p>
          <p className="text-sm mt-1">{t.accounts.noAccountsDesc}</p>
        </motion.div>
      )}
    </div>
  )
}
