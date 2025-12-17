import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components/ui/Components';
import { ArrowLeft, CheckCircle, Mail, Lock, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Verification, 3: Reset, 4: Success
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRequestLink = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleVerify = () => {
    setIsLoading(true);
    // Simulate clicking the email link
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 1000);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
    }

    if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep(4);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 relative overflow-hidden">
       {/* Abstract Background Shapes (Matching Login) */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
         <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold-500 blur-3xl"></div>
         <div className="absolute top-1/2 -left-24 w-72 h-72 rounded-full bg-blue-600 blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 backdrop-blur-md bg-white/95 dark:bg-navy-900/90 border-white/20 p-8 shadow-2xl">
        <button 
           onClick={() => navigate('/login')}
           className="absolute top-6 left-6 text-slate-400 hover:text-navy-900 dark:hover:text-white transition-colors"
        >
            <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center mb-8 mt-4">
          <div className="mx-auto w-14 h-14 bg-navy-50 dark:bg-navy-800 rounded-full flex items-center justify-center mb-4">
             {step === 1 && <KeyRound className="w-7 h-7 text-gold-500" />}
             {step === 2 && <Mail className="w-7 h-7 text-blue-500" />}
             {step === 3 && <Lock className="w-7 h-7 text-gold-500" />}
             {step === 4 && <CheckCircle className="w-7 h-7 text-emerald-500" />}
          </div>
          
          <h2 className="text-2xl font-serif font-medium text-navy-900 dark:text-white">
            {step === 1 && 'Forgot Password'}
            {step === 2 && 'Check Your Email'}
            {step === 3 && 'Reset Password'}
            {step === 4 && 'Password Reset'}
          </h2>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 px-4">
            {step === 1 && 'Enter your email address and we will send you a link to reset your password.'}
            {step === 2 && `We have sent a password reset link to ${email}.`}
            {step === 3 && 'Enter your new password below.'}
            {step === 4 && 'Your password has been successfully reset. You can now login.'}
          </p>
        </div>

        {step === 1 && (
            <form onSubmit={handleRequestLink} className="space-y-6">
                <Input 
                    label="Email Address"
                    type="email"
                    placeholder="you@nexus.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="dark:bg-navy-950 dark:border-navy-700"
                />
                <Button 
                    type="submit" 
                    className="w-full"
                    isLoading={isLoading}
                >
                    Send Reset Link
                </Button>
            </form>
        )}

        {step === 2 && (
            <div className="space-y-6">
                <div className="p-4 bg-blue-50 dark:bg-navy-800 rounded-lg text-sm text-blue-800 dark:text-blue-200 text-center">
                    Didn't receive the email? Check your spam folder or <button className="font-semibold underline">resend</button>.
                </div>
                
                <div className="border-t border-slate-200 dark:border-navy-700 pt-6">
                    <p className="text-xs text-center text-slate-400 mb-4 uppercase tracking-wider font-semibold">Demo Only</p>
                    <Button 
                        variant="secondary"
                        onClick={handleVerify} 
                        className="w-full"
                        isLoading={isLoading}
                    >
                        Simulate Clicking Link
                    </Button>
                </div>
            </div>
        )}

        {step === 3 && (
            <form onSubmit={handleReset} className="space-y-6">
                <Input 
                    label="New Password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="dark:bg-navy-950 dark:border-navy-700"
                />
                <Input 
                    label="Confirm Password"
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    className="dark:bg-navy-950 dark:border-navy-700"
                />
                
                {error && (
                    <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-sm">
                        {error}
                    </div>
                )}

                <Button 
                    type="submit" 
                    className="w-full"
                    isLoading={isLoading}
                >
                    Reset Password
                </Button>
            </form>
        )}

        {step === 4 && (
            <div className="space-y-6">
                <Button 
                    onClick={() => navigate('/login')} 
                    className="w-full"
                >
                    Back to Login
                </Button>
            </div>
        )}

      </Card>
    </div>
  );
};

export default ForgotPassword;