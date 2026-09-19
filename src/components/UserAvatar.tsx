"use client";

import React, { useState, useEffect } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
  iconClassName?: string;
}

const AVATAR_GRADIENTS = [
  "bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600",
  "bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600",
  "bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-600",
  "bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-pink-500",
  "bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600",
  "bg-gradient-to-tr from-rose-500 via-pink-600 to-purple-600",
];

function getAvatarGradient(name?: string | null): string {
  const clean = (name || "").replace(/^@/, "").trim();
  if (!clean) return AVATAR_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

export default function UserAvatar({
  src,
  name,
  className = "w-7 h-7 rounded-full text-xs",
  iconClassName = "w-3.5 h-3.5",
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const cleanName = (name || "").replace(/^@/, "").trim();
  const initial = cleanName ? cleanName[0].toUpperCase() : "";
  const bgGradient = getAvatarGradient(cleanName);

  if (src && !hasError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={cleanName || "User avatar"}
        onError={() => setHasError(true)}
        className={cn("object-cover shrink-0 rounded-full", className)}
      />
    );
  }

  if (initial) {
    return (
      <div
        className={cn(
          "text-white font-black flex items-center justify-center shrink-0 uppercase select-none shadow-xs transition-all",
          bgGradient,
          className
        )}
      >
        {initial}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-black/10 dark:bg-white/10 text-current flex items-center justify-center shrink-0 rounded-full",
        className
      )}
    >
      <User className={iconClassName} />
    </div>
  );
}
