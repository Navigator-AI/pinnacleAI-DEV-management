import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Triangle, Loader2, Eye, EyeOff, Mail, Lock, CheckCircle } from "lucide-react";
import "./login.css";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  mustChangePassword?: boolean;
  message: string;
}

interface LoginPageProps {
  onLoginSuccess: (user: LoginResponse['user'], mustChangePassword?: boolean) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  
  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'code' | 'password' | 'success'>('email');
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest): Promise<LoginResponse> => {
      console.log('Attempting login with:', credentials.email);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login error:', errorData);
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();
      console.log('Login success:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Calling onLoginSuccess with:', data.user, 'mustChange:', data.mustChangePassword);
      onLoginSuccess(data.user, data.mustChangePassword);
    },
    onError: (error: Error) => {
      console.error('Login mutation error:', error);
      setError(error.message);
    },
  });

  // Forgot password mutations
  const requestResetMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send reset code");
      }
      return response.json();
    },
    onSuccess: () => {
      setResetSuccess("Reset code sent to your email!");
      setResetError("");
      setForgotPasswordStep('code');
    },
    onError: (error: Error) => {
      setResetError(error.message);
      setResetSuccess("");
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Invalid code");
      }
      return response.json();
    },
    onSuccess: () => {
      setResetSuccess("Code verified!");
      setResetError("");
      setForgotPasswordStep('password');
    },
    onError: (error: Error) => {
      setResetError(error.message);
      setResetSuccess("");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ code, newPassword }: { code: string; newPassword: string }) => {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, newPassword }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reset password");
      }
      return response.json();
    },
    onSuccess: () => {
      setResetSuccess("Password reset successfully!");
      setResetError("");
      setForgotPasswordStep('success');
    },
    onError: (error: Error) => {
      setResetError(error.message);
      setResetSuccess("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    loginMutation.mutate({ email, password });
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setForgotPasswordStep('email');
    setResetEmail("");
    setResetCode("");
    setNewPassword("");
    setConfirmPassword("");
    setResetError("");
    setResetSuccess("");
  };

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setResetError("Please enter your email");
      return;
    }
    requestResetMutation.mutate(resetEmail);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode || resetCode.length !== 6) {
      setResetError("Please enter the 6-digit code");
      return;
    }
    verifyCodeMutation.mutate(resetCode);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setResetError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match");
      return;
    }
    resetPasswordMutation.mutate({ code: resetCode, newPassword });
  };

  const handleCloseDialog = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep('email');
    setResetEmail("");
    setResetCode("");
    setNewPassword("");
    setConfirmPassword("");
    setResetError("");
    setResetSuccess("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 login-page-container">
      <div className="w-full max-w-md login-content">
        {/* Header with gradient logo */}
        <div className="text-center mb-8 header-section">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.32em] text-cyan-100/90 backdrop-blur-sm hero-kicker">
            Pinnacle AI
          </div>
          <div className="flex justify-center mt-6 mb-5 logo-container">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 text-white shadow-lg logo-circle">
              <Triangle className="h-8 w-8 fill-current" />
            </div>
          </div>
          <h1 className="hero-title mb-2 text-3xl font-semibold tracking-[0.16em] md:text-4xl">
            TASK MANAGEMENT
          </h1>
          <p className="hero-subtitle text-sm">
            Enterprise project management platform
          </p>
        </div>

        {/* Login Card */}
        <Card className="login-card">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2 input-group">
                <Label htmlFor="email" className="text-slate-200 label-text">Username</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter your username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loginMutation.isPending}
                  className="input-field"
                />
              </div>
              <div className="space-y-2 input-group">
                <Label htmlFor="password" className="text-slate-200 label-text">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loginMutation.isPending}
                    className="input-field pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-cyan-200 eye-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loginMutation.isPending}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="text-right forgot-password-container">
                <button 
                  type="button" 
                  className="text-sm text-cyan-300 hover:text-cyan-200 forgot-password-link"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </button>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-900/50 border-red-700 text-red-200 error-alert">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:via-sky-500 hover:to-indigo-500 text-white font-medium py-3 rounded-xl transition-all duration-200 submit-button" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 footer-section">
          <p className="text-xs text-slate-500">
            © 2026 Task Management AI. All rights reserved.
          </p>
        </div>

        {/* Forgot Password Dialog */}
        <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {forgotPasswordStep === 'email' && 'Reset Password'}
                {forgotPasswordStep === 'code' && 'Enter Verification Code'}
                {forgotPasswordStep === 'password' && 'Create New Password'}
                {forgotPasswordStep === 'success' && 'Password Reset Successful'}
              </DialogTitle>
              <DialogDescription>
                {forgotPasswordStep === 'email' && 'Enter your email address and we\'ll send you a verification code'}
                {forgotPasswordStep === 'code' && 'Enter the 6-digit code sent to your email'}
                {forgotPasswordStep === 'password' && 'Enter your new password'}
                {forgotPasswordStep === 'success' && 'Your password has been reset successfully'}
              </DialogDescription>
            </DialogHeader>

            {/* Step 1: Email */}
            {forgotPasswordStep === 'email' && (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-10 input-field"
                    required
                  />
                </div>
                </div>

                {resetError && (
                  <Alert variant="destructive">
                    <AlertDescription>{resetError}</AlertDescription>
                  </Alert>
                )}

                {resetSuccess && (
                  <Alert className="bg-green-50 text-green-900 border-green-200">
                    <AlertDescription>{resetSuccess}</AlertDescription>
                  </Alert>
                )}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={requestResetMutation.isPending} className="hover:shadow-lg transition-all duration-200">
                    {requestResetMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Code'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}

            {/* Step 2: Verification Code */}
            {forgotPasswordStep === 'code' && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-code">Verification Code</Label>
                  <Input
                    id="reset-code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest input-field"
                    required
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Check your email for the verification code
                  </p>
                </div>

                {resetError && (
                  <Alert variant="destructive">
                    <AlertDescription>{resetError}</AlertDescription>
                  </Alert>
                )}

                {resetSuccess && (
                  <Alert className="bg-green-50 text-green-900 border-green-200">
                    <AlertDescription>{resetSuccess}</AlertDescription>
                  </Alert>
                )}

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setForgotPasswordStep('email')}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={verifyCodeMutation.isPending} className="hover:shadow-lg transition-all duration-200">
                    {verifyCodeMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Code'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}

            {/* Step 3: New Password */}
            {forgotPasswordStep === 'password' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 input-field"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 input-field"
                      required
                    />
                  </div>
                </div>

                {resetError && (
                  <Alert variant="destructive">
                    <AlertDescription>{resetError}</AlertDescription>
                  </Alert>
                )}

                {resetSuccess && (
                  <Alert className="bg-green-50 text-green-900 border-green-200">
                    <AlertDescription>{resetSuccess}</AlertDescription>
                  </Alert>
                )}

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setForgotPasswordStep('code')}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={resetPasswordMutation.isPending} className="hover:shadow-lg transition-all duration-200">
                    {resetPasswordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}

            {/* Step 4: Success */}
            {forgotPasswordStep === 'success' && (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="rounded-full bg-green-100 p-3 mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-center text-muted-foreground">
                    Your password has been reset successfully. You can now login with your new password.
                  </p>
                </div>

                <DialogFooter>
                  <Button 
                    onClick={() => {
                      handleCloseDialog();
                    }}
                    className="w-full hover:shadow-lg transition-all duration-200"
                  >
                    Back to Login
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
