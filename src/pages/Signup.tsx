import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/i18n'
import { Loader2, Wallet, CheckCircle2 } from 'lucide-react'

export default function Signup() {
  const { signUp } = useAuth()
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(t.auth.passwordMismatch)
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h2 className="text-xl font-semibold">{t.auth.checkEmail}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t.auth.confirmationSent}</p>
            <Link to="/login">
              <Button className="mt-6 w-full">{t.auth.backToLogin}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Real Balance</CardTitle>
          <p className="text-sm text-muted-foreground">{t.auth.signupSubtitle}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">{t.auth.email}</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t.auth.password}</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t.auth.confirmPassword}</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.auth.signup}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t.auth.hasAccount}{' '}
            <Link to="/login" className="text-primary hover:underline">
              {t.auth.loginLink}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
