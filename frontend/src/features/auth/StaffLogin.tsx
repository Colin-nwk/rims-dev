import { Button, Card, Input } from '@/components/ui/Components';
import { useLogin } from '@/hooks/useAuth';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/App';

const StaffLogin = () => {
    const [service_no, setServiceNo] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { mutate: login, isPending } = useLogin();
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        login(
            { service_no, password },
            {
                onSuccess: () => {
                    showToast('Login successful', 'success');
                    navigate('/dashboard');
                },
                onError: (error) => {
                    showToast(error.message || 'Login failed', 'error');
                },
            }
        );
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
                    {/* <h2 className="text-2xl font-medium text-navy-900 dark:text-white">Nigerian Correctional Service</h2> */}
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm uppercase tracking-wide font-medium">Registry Management System</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Service No"
                        type="text"
                        placeholder="00001"
                        value={service_no}
                        onChange={(e) => setServiceNo(e.target.value)}
                        required
                        className="dark:bg-navy-950 dark:border-navy-700"
                        disabled={isPending}
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="dark:bg-navy-950 dark:border-navy-700"
                        disabled={isPending}
                    />

                    <div className="flex items-center justify-end text-sm">
                        <button
                            type="button"
                            onClick={() => navigate('/demo/forgot-password')}
                            className="text-navy-900 dark:text-gold-500 hover:text-gold-600 dark:hover:text-gold-400 font-medium transition-colors"
                            disabled={isPending}
                        >
                            Forgot password?
                        </button>
                    </div>

                    <Button
                        type="submit"
                        className="w-full text-base shadow-lg shadow-navy-900/20 bg-navy-900 hover:bg-navy-800 text-white"
                        isLoading={isPending}
                        disabled={isPending}
                    >
                        Sign In
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default StaffLogin;