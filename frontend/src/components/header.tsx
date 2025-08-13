'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, TrendingUp, Star, Bell, User, LogOut, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';
import { signOut } from '@/lib/supabase';
import { useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const navItems = [
    { href: '/', label: 'Leaderboard', icon: TrendingUp },
    { href: '/search', label: 'Add Artists', icon: Search },
    { href: '/watchlist', label: 'Watchlist', icon: Star },
    { href: '/alerts', label: 'Alerts', icon: Bell },
  ];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Music className="w-8 h-8 text-spotify-green" />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Music Monitor</span>
                <span className="text-xs text-gray-700 dark:text-white">Built by Sage & Indy 🎸</span>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      pathname === item.href
                        ? 'bg-gray-100 dark:bg-gray-700 text-spotify-green'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="relative">
            {user ? (
              <>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      onClick={() => setShowMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}