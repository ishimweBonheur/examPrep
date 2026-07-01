import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { base44 } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPlus, Mail, Lock, Loader2, GraduationCap, User, Eye, EyeOff, Check, X, Shield, ShieldCheck, ShieldAlert, ArrowLeft } from 'lucide-react'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import AuthLayout from '@/components/AuthLayout'
import { toast } from '@/components/ui/use-toast'
import { STUDENT_LEVELS, levelLabel } from '@/lib/student-level'
import type { StudentLevel } from '@/types'

// Password strength checker
interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  icon: React.ReactNode;
  checks: {
    minLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

function checkPasswordStrength(password: string): PasswordStrength {
  const checks = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  
  if (password.length === 0) {
    return {
      score: 0,
      label: 'No password',
      color: 'text-muted-foreground',
      icon: null,
      checks,
    };
  }

  if (passedChecks <= 2) {
    return {
      score: 1,
      label: 'Weak',
      color: 'text-red-500',
      icon: <ShieldAlert className="w-4 h-4" />,
      checks,
    };
  }

  if (passedChecks === 3) {
    return {
      score: 2,
      label: 'Fair',
      color: 'text-orange-500',
      icon: <ShieldAlert className="w-4 h-4" />,
      checks,
    };
  }

  if (passedChecks === 4) {
    return {
      score: 3,
      label: 'Good',
      color: 'text-yellow-500',
      icon: <ShieldCheck className="w-4 h-4" />,
      checks,
    };
  }

  return {
    score: 4,
    label: 'Strong',
    color: 'text-green-500',
    icon: <ShieldCheck className="w-4 h-4" />,
    checks,
  };
}

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [level, setLevel] = useState<StudentLevel>('S3')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Field touched states for validation
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})
  
  // Password strength
  const passwordStrength = checkPasswordStrength(password)
  const strengthBarWidth = password.length === 0 ? 0 : ((passwordStrength.score + 1) / 5) * 100

  // Field validations
  const validations = {
    fullName: fullName.length >= 2 || !touchedFields.fullName,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !touchedFields.email,
    password: passwordStrength.score >= 2 || !touchedFields.password,
    confirmPassword: (password === confirmPassword && confirmPassword.length > 0) || !touchedFields.confirmPassword,
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    
    // Mark all fields as touched
    setTouchedFields({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    })
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (passwordStrength.score < 2) {
      setError('Please use a stronger password')
      return
    }
    
    setLoading(true)
    try {
      await base44.auth.register({ email, password, full_name: fullName, level })
      setShowOtp(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    setError('')
    setLoading(true)
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode })
      if (result?.access_token) {
        base44.auth.setToken(result.access_token)
      }
      window.location.href = result.user?.role === 'admin' ? '/admin' : '/dashboard'
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    try {
      await base44.auth.resendOtp(email)
      toast({ title: 'Code sent', description: 'Check your email for the new code.' })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend code')
    }
  }

  const handleBlur = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }))
  }

  if (showOtp) {
    return (
      <AuthLayout icon={Mail} title="Verify your email" subtitle={`We sent a code to ${email}`}>
        {/* Back button for OTP screen */}
        <button
          onClick={() => setShowOtp(false)}
          className="mb-4 flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          type="button"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to registration
        </button>

        {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-start">
          <div className="flex-shrink-0 mr-2 mt-0.5">⚠️</div>
          <div>
            <p className="font-medium">Verification failed</p>
            <p className="text-xs mt-1 opacity-80">{error}</p>
          </div>
        </div>}
        <div className="flex justify-center mb-6">
          <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button className="w-full h-12 font-medium" onClick={handleVerify} disabled={loading || otpCode.length < 6}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</> : 'Verify'}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Didn't receive the code?{' '}
          <button 
            onClick={handleResend} 
            className="text-primary font-medium hover:underline"
            disabled={loading}
          >
            Resend
          </button>
        </p>
        <p className="text-center text-xs text-muted-foreground mt-2">
          Check spam folder if you don't see the email
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Sign up to get started"
      footer={<>Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link></>}
    >
      {/* Back to home link */}
      <Link
        to="/"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to home
      </Link>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-start">
          <div className="flex-shrink-0 mr-2 mt-0.5">⚠️</div>
          <div>
            <p className="font-medium">Registration failed</p>
            <p className="text-xs mt-1 opacity-80">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name Field */}
        <div className="space-y-2">
          <Label htmlFor="full_name">
            Full name
            {!validations.fullName && (
              <span className="text-destructive text-xs ml-2">Required (min. 2 characters)</span>
            )}
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              id="full_name" 
              placeholder="Your name" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => handleBlur('fullName')}
              className={`pl-10 h-12 ${!validations.fullName ? 'border-destructive focus-visible:ring-destructive' : ''}`} 
              required 
              minLength={2}
              aria-invalid={!validations.fullName}
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email
            {!validations.email && (
              <span className="text-destructive text-xs ml-2">Please enter a valid email</span>
            )}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              id="email" 
              type="email" 
              autoComplete="email" 
              placeholder="you@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              className={`pl-10 h-12 ${!validations.email ? 'border-destructive focus-visible:ring-destructive' : ''}`} 
              required 
              aria-invalid={!validations.email}
            />
          </div>
        </div>

        {/* Level Field */}
        <div className="space-y-2">
          <Label htmlFor="level">Class level</Label>
          <Select value={level} onValueChange={(v) => setLevel(v as StudentLevel)}>
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STUDENT_LEVELS.map((l) => (
                <SelectItem key={l} value={l}>
                  {levelLabel(l)} ({l})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <GraduationCap className="w-3 h-3" /> Determines your community, content, and resources.
          </p>
        </div>

        {/* Password Field with Strength Indicator */}
        <div className="space-y-2">
          <Label htmlFor="password">
            Password
            {!validations.password && (
              <span className="text-destructive text-xs ml-2">Password is too weak</span>
            )}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"}
              autoComplete="new-password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              className={`pl-10 pr-10 h-12 ${!validations.password ? 'border-destructive focus-visible:ring-destructive' : ''}`} 
              required 
              minLength={8}
              aria-invalid={!validations.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded p-1"
              tabIndex={loading ? -1 : 0}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Password Strength Meter */}
          {password.length > 0 && (
            <div className="space-y-2 mt-2">
              {/* Strength Bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      passwordStrength.score <= 1 ? 'bg-red-500' :
                      passwordStrength.score === 2 ? 'bg-orange-500' :
                      passwordStrength.score === 3 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${strengthBarWidth}%` }}
                  />
                </div>
                <span className={`text-xs font-medium flex items-center gap-1 ${passwordStrength.color}`}>
                  {passwordStrength.icon}
                  {passwordStrength.label}
                </span>
              </div>

              {/* Password Requirements Checklist */}
              <div className="grid grid-cols-2 gap-1">
                <div className="flex items-center gap-1 text-xs">
                  {passwordStrength.checks.minLength ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <X className="w-3 h-3 text-muted-foreground" />
                  )}
                  <span className={passwordStrength.checks.minLength ? 'text-green-600' : 'text-muted-foreground'}>
                    8+ characters
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {passwordStrength.checks.hasUpperCase ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <X className="w-3 h-3 text-muted-foreground" />
                  )}
                  <span className={passwordStrength.checks.hasUpperCase ? 'text-green-600' : 'text-muted-foreground'}>
                    Uppercase
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {passwordStrength.checks.hasLowerCase ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <X className="w-3 h-3 text-muted-foreground" />
                  )}
                  <span className={passwordStrength.checks.hasLowerCase ? 'text-green-600' : 'text-muted-foreground'}>
                    Lowercase
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {passwordStrength.checks.hasNumber ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <X className="w-3 h-3 text-muted-foreground" />
                  )}
                  <span className={passwordStrength.checks.hasNumber ? 'text-green-600' : 'text-muted-foreground'}>
                    Number
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs col-span-2">
                  {passwordStrength.checks.hasSpecialChar ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <X className="w-3 h-3 text-muted-foreground" />
                  )}
                  <span className={passwordStrength.checks.hasSpecialChar ? 'text-green-600' : 'text-muted-foreground'}>
                    Special character (!@#$%^&*)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirm">
            Confirm Password
            {!validations.confirmPassword && touchedFields.confirmPassword && (
              <span className="text-destructive text-xs ml-2">Passwords don't match</span>
            )}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              id="confirm" 
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password" 
              placeholder="••••••••" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              className={`pl-10 pr-10 h-12 ${!validations.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`} 
              required 
              aria-invalid={!validations.confirmPassword}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded p-1"
              tabIndex={loading ? -1 : 0}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {/* Password Match Indicator */}
          {confirmPassword.length > 0 && password.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              {password === confirmPassword ? (
                <>
                  <Check className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600">Passwords match</span>
                </>
              ) : (
                <>
                  <X className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-red-600">Passwords don't match</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            required
          />
          <label htmlFor="terms" className="text-xs text-muted-foreground">
            I agree to the{' '}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </label>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 font-medium" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>

        {/* Security Notice */}
        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" />
          Your information is secure and encrypted
        </p>
      </form>
    </AuthLayout>
  )
}