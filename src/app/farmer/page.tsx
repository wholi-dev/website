'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export default function FarmerSignIn() {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      router.push('/farmer/dashboard');
    }
  }, [session, router]);

  return (
    <div className="flex flex-col justify-center min-h-screen py-8 bg-[color:var(--color-background)] text-[color:var(--color-text)] font-body mx-4 sm:mx-8 md:mx-16 lg:mx-64">
      <h1 className="text-4xl font-bold mb-8 text-center">Farmer Sign In</h1>
      {!session ? (
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']}
        />
      ) : (
        <p>Loading...</p>
      )}
      <p className="mt-8 text-lg text-center">
        Don't have an account? <a href="/farmer/signup" className="underline">Sign up</a>
      </p>
      <a href="/" className="mt-4 text-lg underline text-center">
        &larr; Back to Home
      </a>
    </div>
  );
}