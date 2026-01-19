'use client';

import { useActionState } from 'react';
import { authenticate } from '@/lib/actions';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginForm() {
    const [errorMessage, formAction, isPending] = useActionState(
        authenticate,
        undefined,
    );

    return (
        <form action={formAction} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                    Email
                </label>
                <Input
                    className="mt-1"
                    id="email"
                    type="email"
                    name="email"
                    placeholder="example@email.com"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                    Password
                </label>
                <Input
                    className="mt-1"
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    required
                    minLength={6}
                />
            </div>
            <div
                className="flex h-8 items-end space-x-1"
                aria-live="polite"
                aria-atomic="true"
            >
                {errorMessage && (
                    <p className="text-sm text-red-500">{errorMessage}</p>
                )}
            </div>
            <Button className="w-full" disabled={isPending}>
                Log in
            </Button>
        </form>
    );
}
