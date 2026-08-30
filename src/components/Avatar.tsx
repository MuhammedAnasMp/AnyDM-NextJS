import * as React from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export function Avatar({ src, name, size = 'md', className, fallbackIcon }: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [src]);

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
      {src && !hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name || "Avatar"}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : fallbackIcon ? (
        fallbackIcon
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
          src={acc.profile_picture_url}
          name={acc.username || "User"}
          size={size}
          className="ring-2 ring-[#131313]"
        />
      ))}
    </div>
  );
}

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export function UserAvatar({
  src,
  alt = "User Avatar",
  className = "w-5 h-5 rounded-full object-cover",
  fallbackIcon,
}: UserAvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "shrink-0 flex items-center justify-center bg-white/10 text-zinc-400 rounded-full select-none overflow-hidden",
          className
        )}
      >
        {fallbackIcon || <User className="w-1/2 h-1/2 text-zinc-400" />}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}

