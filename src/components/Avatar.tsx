import * as React from 'react';
import { cn } from '@/lib/utils';

export function getUserDisplayName(user?: {
  display_name?: string | null;
  first_name?: string | null;
  username?: string | null;
  email?: string | null;
} | null): string {
  if (!user) return "User";
  if (user.display_name && user.display_name.trim()) return user.display_name.trim();
  if (user.first_name && user.first_name.trim()) return user.first_name.trim();
  if (user.username && user.username.trim() && !user.username.includes("@")) return user.username.trim();
  if (user.email && user.email.trim()) return user.email.trim();
  return "User";
}

export function getUserInitial(userOrName?: any): string {
  if (!userOrName) return "U";
  let nameStr = "";
  if (typeof userOrName === "string") {
    nameStr = userOrName;
  } else {
    nameStr = getUserDisplayName(userOrName);
  }
  nameStr = nameStr.trim();
  if (!nameStr) return "U";

  return nameStr.charAt(0).toUpperCase();
}

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

  const fallback = getUserInitial(name);
  const isValidSrc = src && typeof src === 'string' && src.trim().length > 0 && !src.includes('vecteezy');

  return (
    <div className={cn(
      "relative rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-[#20201f] text-[#e5e2e1] font-bold border border-[#2a2a2a] select-none",
      sizeClasses[size],
      className
    )}>
      {isValidSrc && !hasError ? (
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

  const isValidSrc = src && typeof src === 'string' && src.trim().length > 0 && !src.includes('vecteezy');

  if (!isValidSrc || hasError) {
    const fallbackChar = getUserInitial(alt !== "User Avatar" ? alt : "");

    return (
      <div
        className={cn(
          "shrink-0 flex items-center justify-center bg-[#20201f] border border-[#2a2a2a] text-[#e5e2e1] font-semibold rounded-full select-none overflow-hidden",
          className
        )}
      >
        <span>{fallbackChar}</span>
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

export function getAvatarRingClass(user?: {
  plan?: string | null;
  is_creator_vip?: boolean | null;
  creator_reward_type?: string | null;
  is_creator_program_active?: boolean | null;
  creator_program_expires_at?: string | null;
  is_premium_active?: boolean | null;
  premium_expires_at?: string | null;
  plan_expires_at?: string | null;
  subscription_expires_at?: string | null;
  expires_at?: string | null;
} | null): string {
  if (!user) {
    return "p-[1px] bg-[#3a3a3a] border border-white/10";
  }

  const now = Date.now();

  const isExpiredDate = (dateStr?: string | null): boolean => {
    if (!dateStr) return false;
    const time = new Date(dateStr).getTime();
    return !isNaN(time) && time <= now;
  };

  // 1 & 2: Creator Program (Active & Not Expired)
  const isCreatorProgramActive = user.is_creator_program_active !== false;
  const isCreatorExpired = isExpiredDate(user.creator_program_expires_at);
  const isCreatorActive = Boolean(user.is_creator_vip) && isCreatorProgramActive && !isCreatorExpired;

  if (isCreatorActive) {
    const rewardType = user.creator_reward_type || 'vip';
    // Creator VIP Pro Plan (Emerald / Cyberpunk Green-Teal gradient ring)
    if (rewardType === 'vip') {
      return "p-[1.5px] bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-300";
    }
    // Creator Cash Commission Plan (Amber / Bronze-Gold gradient ring)
    if (rewardType === 'commission') {
      return "p-[1.5px] bg-gradient-to-tr from-amber-600 via-amber-400 to-[#FFCF40]";
    }
  }

  // 3: Paid Pro User (Active & Not Expired - purchased with money or points)
  const paidExpiresAt = user.premium_expires_at || user.plan_expires_at || user.subscription_expires_at || user.expires_at;
  const isPaidExpired = isExpiredDate(paidExpiresAt);
  const isPaidActive = user.is_premium_active !== false && !isPaidExpired;
  const isPaidPro = (user.plan === 'pro' || Boolean(user.is_premium_active)) && isPaidActive;

  if (isPaidPro) {
    return "p-[1.5px] bg-gradient-to-tr from-[#A67C00] via-[#BF9B30] via-[#FFBF00] via-[#FFCF40] to-[#FFDC73]";
  }

  // Default / Free / Expired Users (Neutral Ring)
  return "p-[1px] bg-[#3a3a3a] border border-white/10";
}


