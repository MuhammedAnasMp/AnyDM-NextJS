'use client';

import * as React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { cn } from '@/lib/utils';

export interface InstagramProfileCardProps {
  customUsername?: string;
  customProfilePic?: string;
  customCategory?: string;
  customFollowers?: string | number;
  customFollowing?: string | number;
  customVerified?: boolean;
  size?: 'full' | 'compact' | 'canvas';
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export function InstagramProfileCard({
  customUsername,
  customProfilePic,
  customCategory,
  customFollowers,
  customFollowing,
  customVerified = true,
  size = 'full',
  onClick,
  className,
}: InstagramProfileCardProps) {
  const { user: appUser, instagramAccounts } = useSelector((state: RootState) => state.auth);

  const activeAccount = React.useMemo(() => {
    if (!instagramAccounts || instagramAccounts.length === 0) return null;
    const found = instagramAccounts.find((acc: any) => acc.id === appUser?.active_instagram_account_id);
    return found || instagramAccounts[0];
  }, [appUser, instagramAccounts]);

  const username = customUsername || activeAccount?.username || activeAccount?.account_name || 'john_doe';
  const profilePic = customProfilePic || activeAccount?.profile_picture_url || activeAccount?.profile_picture || null;
  const initials = (username.replace(/^@/, '').slice(0, 2) || 'JD').toUpperCase();
  const category = customCategory || activeAccount?.category || activeAccount?.biography || 'Digital Creator';

  const rawFollowers = customFollowers ?? activeAccount?.followers_count;
  const followers = React.useMemo(() => {
    if (typeof rawFollowers === 'number') {
      if (rawFollowers >= 1000000) return (rawFollowers / 1000000).toFixed(1) + 'M';
      if (rawFollowers >= 1000) return (rawFollowers / 1000).toFixed(1) + 'K';
      return String(rawFollowers);
    }
    return rawFollowers || '12.4K';
  }, [rawFollowers]);

  const rawFollowing = customFollowing ?? activeAccount?.following_count;
  const following = React.useMemo(() => {
    if (typeof rawFollowing === 'number') {
      if (rawFollowing >= 1000) return (rawFollowing / 1000).toFixed(1) + 'K';
      return String(rawFollowing);
    }
    return rawFollowing || '842';
  }, [rawFollowing]);

  if (size === 'compact' || size === 'canvas') {
    return (
      <div
        onClick={onClick}
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl transition-all select-none",
          onClick && "cursor-pointer hover:border-white/20",
          className
        )}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-zinc-900 to-black pointer-events-none" />

        {/* Ambient Glows */}
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-600/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-pink-600/10 blur-2xl pointer-events-none" />

        {/* Content */}
        <div className="relative flex flex-col justify-between p-4.5 gap-3.5">
          {/* Top section */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              {/* Profile Picture with Instagram Gradient Ring */}
              <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
                <div className="h-full w-full rounded-full bg-zinc-800 p-[1.5px] overflow-hidden">
                  {profilePic ? (
                    <img src={profilePic} alt={username} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-xs font-bold text-white">
                      {initials}
                    </div>
                  )}
                </div>
              </div>

              {/* Username + Category */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white truncate leading-tight">
                    {username}
                  </span>
                  {customVerified && (
                    <svg className="h-3.5 w-3.5 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l2.1 2.1 3-.4.9 2.9 2.6 1.5-1.5 2.6.4 3-2.9.9-1.5 2.6-2.6-1.5-2.6 1.5-.9-2.9-3-.9.4-3-1.5-2.6 2.6-1.5.9-2.9 3 .4L12 2z" />
                      <path d="M10.5 14.8l-2.4-2.4 1.1-1.1 1.3 1.3 4.3-4.3 1.1 1.1-5.4 5.4z" fill="white" />
                    </svg>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                  {category}
                </p>
              </div>
            </div>

            {/* Instagram Glyph */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-2 shrink-0">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" />
              </svg>
            </div>
          </div>

          {/* Stats section */}
          <div className="flex gap-6 px-1">
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                {followers}
              </p>
              <p className="text-[9px] text-zinc-500">
                Followers
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                {following}
              </p>
              <p className="text-[9px] text-zinc-500">
                Following
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-0.5">
            <button
              type="button"
              className="flex-1 rounded-xl bg-white py-2 text-xs font-bold text-black transition hover:bg-zinc-200 cursor-pointer shadow-sm"
            >
              Follow
            </button>
            <button
              type="button"
              className="flex-1 rounded-xl border border-white/15 bg-white/5 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/10 cursor-pointer"
            >
              Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full 5:3 Aspect Profile Card
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative w-full max-w-[500px] aspect-[5/3] overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl select-none",
        onClick && "cursor-pointer hover:border-white/20",
        className
      )}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-zinc-900 to-black pointer-events-none" />

      {/* Glow Effects */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-pink-600/10 blur-3xl pointer-events-none" />

      {/* Card Content */}
      <div className="relative flex h-full flex-col justify-between p-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          {/* Profile Details */}
          <div className="flex items-center gap-4">
            {/* Profile Picture with Ring */}
            <div className="h-20 w-20 shrink-0 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[3px]">
              <div className="h-full w-full rounded-full bg-zinc-800 p-[3px] overflow-hidden">
                {profilePic ? (
                  <img src={profilePic} alt={username} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-xl font-bold text-white">
                    {initials}
                  </div>
                )}
              </div>
            </div>

            {/* Username & Category */}
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl font-bold text-white">
                  {username}
                </h2>
                {customVerified && (
                  <svg className="h-5 w-5 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.1 2.1 3-.4.9 2.9 2.6 1.5-1.5 2.6.4 3-2.9.9-1.5 2.6-2.6-1.5-2.6 1.5-.9-2.9-3-.9.4-3-1.5-2.6 2.6-1.5.9-2.9 3 .4L12 2z" />
                    <path d="M10.5 14.8l-2.4-2.4 1.1-1.1 1.3 1.3 4.3-4.3 1.1 1.1-5.4 5.4z" fill="white" />
                  </svg>
                )}
              </div>
              <p className="mt-1 text-sm text-zinc-400">
                {category}
              </p>
            </div>
          </div>

          {/* Instagram Icon */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 shrink-0">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" />
            </svg>
          </div>
        </div>

        {/* Bottom Section */}
        <div>
          {/* Stats */}
          <div className="mb-5 flex gap-8">
            <div>
              <p className="text-lg font-bold text-white">
                {followers}
              </p>
              <p className="text-xs text-zinc-500">
                Followers
              </p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">
                {following}
              </p>
              <p className="text-xs text-zinc-500">
                Following
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 rounded-xl bg-white py-2.5 text-sm font-bold text-black transition hover:bg-zinc-200 cursor-pointer"
            >
              Follow
            </button>
            <button
              type="button"
              className="flex-1 rounded-xl border border-white/15 bg-white/5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10 cursor-pointer"
            >
              Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
