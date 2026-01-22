'use client';

import { useActionState, useState } from 'react';
import { authenticate } from '@/lib/actions';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
    const [errorMessage, formAction, isPending] = useActionState(
        authenticate,
        undefined,
    );
    const [showPassword, setShowPassword] = useState(false);

    return (
        <form action={formAction} className="space-y-6">
            <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 ml-1 uppercase tracking-wider" htmlFor="email">
                    Email
                </label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors duration-300" />
                    </div>
                    <Input
                        className="block w-full pl-11 h-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:bg-white transition-all duration-300"
                        id="email"
                        type="email"
                        name="email"
                        placeholder="name@company.com"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 ml-1 uppercase tracking-wider" htmlFor="password">
                    Password
                </label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors duration-300" />
                    </div>
                    <Input
                        className="block w-full pl-11 pr-11 h-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:bg-white transition-all duration-300"
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        required
                        minLength={6}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-sky-500 transition-colors"
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </div>

            <div
                className="flex h-6 items-end space-x-1"
                aria-live="polite"
                aria-atomic="true"
            >
                {errorMessage && (
                    <div className="flex w-full items-center gap-2 text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        <p className="text-xs font-semibold">{errorMessage}</p>
                    </div>
                )}
            </div>

            <Button
                className="w-full h-12 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.23)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border-none relative overflow-hidden group"
                disabled={isPending}
            >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] opacity-0 group-hover:opacity-100 animate-shimmer" />
                <span className="relative flex items-center justify-center gap-2 text-base">
                    {isPending ? 'Logging in...' : 'Sign In'}
                    {!isPending && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    )}
                </span>
            </Button>
        </form>
    );
}
