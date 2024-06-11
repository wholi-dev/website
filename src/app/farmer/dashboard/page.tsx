'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export default function signOut() {
    const [session, setSession] = useState<Session | null>(null);
    const router = useRouter();
    
    useEffect(() => {
        supabase.auth.signOut().then(() => {
        router.push('/');
        });
    }, []);
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-8 bg-[color:var(--color-background)] text-[color:var(--color-text)] font-body">
        <h1 className="text-4xl font-bold mb-8">Signing out...</h1>
        </div>
    );
    }