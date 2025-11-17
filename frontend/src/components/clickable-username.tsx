'use client';

import Link from 'next/link';

interface ClickableUsernameProps {
  user: {
    id: string;
    name: string | null;
    email?: string | null;
  };
  className?: string;
}

export function ClickableUsername({ user, className = '' }: ClickableUsernameProps) {
  const displayName = user.name || user.email?.split('@')[0] || 'Unknown User';

  return (
    <Link
      href={`/profile/${user.id}`}
      className={`hover:text-spotify-green transition-colors cursor-pointer ${className}`}
    >
      {displayName}
    </Link>
  );
}