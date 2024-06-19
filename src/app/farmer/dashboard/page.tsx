'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import Link from 'next/link';

export default function signOut() {
    useEffect(() => {
        supabase.auth.signOut()
    }, []);
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-8 bg-[color:var(--color-background)] text-[color:var(--color-text)] font-body">
        <h1 className="text-4xl font-bold mb-8">Signing out...</h1>
        <Link href='/'>Return to homepage</Link>
        </div>
    );
    }