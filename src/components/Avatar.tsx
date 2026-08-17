import * as React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg'
  };

  const fallback = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className={cn(
      "relative rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-zinc-800 text-zinc-300 font-bold border border-white/10 select-none",
      sizeClasses[size],
      className
    )}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name || "Avatar"} className="w-full h-full object-cover" />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}

interface OverlappingAvatarsProps {
  accounts: Array<{ profile_picture_url?: string; username?: string }>;
  size?: 'sm' | 'md' | 'lg';
}

export function OverlappingAvatars({ accounts, size = 'md' }: OverlappingAvatarsProps) {
  const limit = 3;
  const visible = accounts.slice(0, limit);

  return (
    <div className="flex items-center -space-x-3">
      {visible.map((acc, index) => (
        <Avatar
          key={index}
          src={acc.profile_picture_url || "https://static.vecteezy.com/system/resources/previews/002/318/271/non_2x/user-profile-icon-free-vector.jpg"}
          name={acc.username || "User"}
          size={size}
          className="ring-2 ring-[#131313]"
        />
      ))}
    </div>
  );
}
