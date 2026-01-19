'use client';

import { useActionState } from 'react';
import { authenticate } from '@/lib/actions';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LogIn } from 'lucide-react'; // Placeholder icon check later

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
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
              placeholder="admin@mediasoftbd.com"
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
      </div>
    </div>
  );
}
