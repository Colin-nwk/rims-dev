import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Button, Input, Card } from '../components/ui/Components';
import { Role } from '../types';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDemoLogin = (role: Role) => {
    const emails = {
      staff: 'staff@nexus.com',
      hr: 'hr@nexus.com',
      admin: 'admin@nexus.com'
    };
    setEmail(emails[role]);
    setPassword('password');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await login(email, 'staff');
    navigate('/');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold-500 blur-3xl"></div>
        <div className="absolute top-1/2 -left-24 w-72 h-72 rounded-full bg-navy-600 blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 backdrop-blur-md bg-white/95 dark:bg-navy-900/90 border-white/20 p-8 shadow-2xl">
        <div className="text-center mb-4">
          <div className="mx-auto w-16 h-16 bg-white dark:bg-navy-800 rounded-xl flex items-center justify-center mb-4 border-2 border-gold-500 shadow-lg">
            <span className="text-navy-900 dark:text-white font-bold text-3xl">N</span>
          </div>
          <h2 className="text-2xl font-medium text-navy-900 dark:text-white">Nigerian Correctional Service</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm uppercase tracking-wide font-medium">Registry Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            placeholder="officer@correctionalservice.gov.ng"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="dark:bg-navy-950 dark:border-navy-700"
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="dark:bg-navy-950 dark:border-navy-700"
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-slate-600 dark:text-slate-400 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded-sm border-slate-300 dark:border-navy-600 text-navy-900 focus:ring-navy-900 mr-2" />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-navy-900 dark:text-gold-500 hover:text-gold-600 dark:hover:text-gold-400 font-medium transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base shadow-lg shadow-navy-900/20 bg-navy-900 hover:bg-navy-800 text-white"
            isLoading={isSubmitting}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-navy-700">
          <p className="text-xs text-center text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-wider font-semibold">Demo Access</p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleDemoLogin('staff')}
              className="px-2 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 rounded-sm text-center transition-colors"
            >
              Staff
            </button>
            <button
              onClick={() => handleDemoLogin('hr')}
              className="px-2 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 rounded-sm text-center transition-colors"
            >
              HR Manager
            </button>
            <button
              onClick={() => handleDemoLogin('admin')}
              className="px-2 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 rounded-sm text-center transition-colors"
            >
              Admin
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;