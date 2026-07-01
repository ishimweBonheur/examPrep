import React, { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [touchedFields, setTouchedFields] = useState<{
    email: boolean;
    password: boolean;
  }>({
    email: false,
    password: false,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await base44.auth.loginViaEmailPassword(email, password);
      
      // Store remember me preference if selected
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }
      
      window.location.href = user.role === "admin" ? "/admin" : "/dashboard";
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Invalid email or password";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleFieldBlur = (field: "email" | "password") => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const showEmailError = touchedFields.email && email.length > 0 && !isValidEmail(email);
  const showPasswordError = touchedFields.password && password.length > 0 && password.length < 6;

  return (
    <AuthLayout
      icon={LogIn}
      title="Welcome back"
      subtitle="Log in to your account"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </>
      }
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
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-start">
          <div className="flex-shrink-0 mr-2 mt-0.5">⚠️</div>
          <div>
            <p className="font-medium">Login failed</p>
            <p className="text-xs mt-1 opacity-80">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">
            Email
            {showEmailError && (
              <span className="text-destructive text-xs ml-2">
                Please enter a valid email
              </span>
            )}
          </Label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleFieldBlur("email")}
              className={`pl-10 h-12 ${showEmailError ? "border-destructive focus-visible:ring-destructive" : ""}`}
              required
              aria-invalid={showEmailError}
              aria-describedby={showEmailError ? "email-error" : undefined}
            />
          </div>
          {showEmailError && (
            <p id="email-error" className="text-xs text-destructive mt-1">
              Please enter a valid email address (e.g., you@example.com)
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">
              Password
              {showPasswordError && (
                <span className="text-destructive text-xs ml-2">
                  Minimum 6 characters
                </span>
              )}
            </Label>
            <Link
              to="/forgot-password"
              className="text-xs text-primary hover:underline"
              tabIndex={loading ? -1 : 0}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleFieldBlur("password")}
              className={`pl-10 pr-10 h-12 ${showPasswordError ? "border-destructive focus-visible:ring-destructive" : ""}`}
              required
              minLength={6}
              aria-invalid={showPasswordError}
              aria-describedby={showPasswordError ? "password-error" : undefined}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
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
          {showPasswordError && (
            <p id="password-error" className="text-xs text-destructive mt-1">
              Password must be at least 6 characters long
            </p>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            tabIndex={loading ? -1 : 0}
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-muted-foreground"
          >
            Remember me
          </label>
        </div>

        <Button
          type="submit"
          className="w-full h-12 font-medium"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
              <span>Logging in...</span>
              <span className="sr-only">Please wait while we log you in</span>
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}