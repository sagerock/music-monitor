'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, Music2, Mail, Lock, Info, Shield } from 'lucide-react';
import { isEmailAllowed, getAccessDeniedMessage, getExampleDomains } from '@/lib/allowed-domains';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Check if email domain is allowed
        if (!isEmailAllowed(email)) {
          setShowAccessDenied(true);
          setIsLoading(false);
          toast.error('This email domain is not authorized for signup');
          return;
        }

        // Sign up new user
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        if (data?.user?.identities?.length === 0) {
          toast.error('An account with this email already exists');
        } else {
          toast.success('Check your email for the confirmation link!');
          setEmail('');
          setPassword('');
        }
      } else {
        // Sign in existing user
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast.success('Welcome back!');
        router.push('/');
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    // Check if email domain is allowed for new users
    if (isSignUp && !isEmailAllowed(email)) {
      setShowAccessDenied(true);
      toast.error('This email domain is not authorized for signup');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      toast.success('Check your email for the login link!');
      setEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-spotify-green/20 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {showAccessDenied ? (
          // Access Denied Message
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-red-500/20 p-3 rounded-full">
                <Shield className="w-8 h-8 text-red-400" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white text-center mb-4">
              Industry Access Required
            </h2>
            
            <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
              <p className="text-gray-300 text-sm leading-relaxed mb-3">
                Music Monitor is exclusively for music industry professionals and students.
              </p>
              
              <div className="space-y-2 mb-3">
                <p className="text-gray-400 text-sm font-semibold">Eligible domains include:</p>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-spotify-green mt-0.5">•</span>
                    <span>Music students at Berklee, NYU, UCLA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-spotify-green mt-0.5">•</span>
                    <span>Record labels (Universal, Sony, Warner, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-spotify-green mt-0.5">•</span>
                    <span>Music platforms (Spotify, Apple Music, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-spotify-green mt-0.5">•</span>
                    <span>Music media & industry companies</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-yellow-200 text-xs">
                  <strong>Your email domain:</strong> <span className="font-mono">{email.split('@')[1] || 'not recognized'}</span>
                </p>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
              <p className="text-gray-300 text-sm mb-2">
                <strong>Are you in the music industry or a student?</strong>
              </p>
              <p className="text-gray-400 text-sm">
                Request access by emailing <a href="mailto:indy@sagerock.com?subject=Music Monitor Access Request" className="text-spotify-green hover:underline">indy@sagerock.com</a> with:
              </p>
              <ul className="text-gray-400 text-sm mt-2 space-y-1">
                <li>• Your name and role</li>
                <li>• Company/school affiliation</li>
                <li>• LinkedIn profile or proof of affiliation</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowAccessDenied(false);
                  setIsSignUp(false);
                }}
                className="w-full py-3 bg-spotify-green text-white font-semibold rounded-lg hover:bg-spotify-green/90 transition-colors"
              >
                Try Different Email
              </button>
              
              <Link
                href="/about"
                className="block w-full py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors border border-white/20 text-center"
              >
                Learn More About Music Monitor
              </Link>
            </div>
          </div>
        ) : (
          // Normal Login/Signup Form
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-spotify-green/20 p-3 rounded-full">
              <Music2 className="w-8 h-8 text-spotify-green" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-300 text-center mb-8">
            {isSignUp 
              ? 'Start tracking rising music artists' 
              : 'Continue discovering music trends'}
          </p>

          {isSignUp && (
            <div className="bg-spotify-green/10 border border-spotify-green/30 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-spotify-green mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-300">
                  Signup is limited to music industry professionals and students at select schools (Berklee, NYU, UCLA). 
                  Students from other schools can request access.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-spotify-green text-white font-semibold rounded-lg hover:bg-spotify-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">Or</span>
            </div>
          </div>

          <button
            onClick={handleMagicLink}
            disabled={isLoading || !email}
            className="w-full py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
          >
            Send Magic Link
          </button>

          <p className="text-center text-gray-300 mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-1 text-spotify-green hover:underline font-medium"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

          <Link
            href="/"
            className="block text-center text-gray-400 hover:text-gray-300 mt-4 text-sm"
          >
            ← Back to Home
          </Link>
        </div>
        )}
      </div>
    </div>
  );
}