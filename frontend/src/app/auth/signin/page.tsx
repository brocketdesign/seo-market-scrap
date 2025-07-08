'use client';

import { getCsrfToken } from '@/lib/auth/mock-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import type { Metadata } from 'next';

// export const metadata: Metadata = {
//   title: 'Sign In | Admin Area',
//   robots: { index: false, follow: false }, // Prevent indexing of sign-in page
// };

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard';
  const error = searchParams.get('error');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      if (token) setCsrfToken(token);
    };
    fetchCsrfToken();
  }, []);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    let result: { ok: boolean; error: string | null } = { ok: false, error: null };
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        // Store token in cookie for middleware (or localStorage if needed)
        document.cookie = `token=${data.token}; path=/;`;
        result = { ok: true, error: null };
      } else {
        const errData = await res.json().catch(() => ({}));
        result = { ok: false, error: errData.message || 'CredentialsSignin' };
      }
    } catch (err) {
      result = { ok: false, error: 'CredentialsSignin' };
    }
    if (result.ok) {
      router.push(callbackUrl);
    } else {
      router.push(`/auth/signin?error=${result.error || 'CredentialsSignin'}&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Sign In
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* CSRF token is handled automatically by NextAuth v4 with Credentials provider, but good to be aware of for other flows */}
          {/* <input name="csrfToken" type="hidden" defaultValue={csrfToken} /> */}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Login failed: </strong>
              <span className="block sm:inline">
                {error === 'CredentialsSignin' ? 'Invalid username or password.' : 'An unknown error occurred.'}
              </span>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
