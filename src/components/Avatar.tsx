"use client";

import { cn } from "@/lib/utils";
import { User } from "lucide-react";

export const Avatar = ({ src, name, size = "sm" }: any) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-14 h-14"
  };

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-7 h-7"
  };

  const currentSizeClass = sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.sm;
  const currentIconSizeClass = iconSizeClasses[size as keyof typeof iconSizeClasses] || iconSizeClasses.sm;

  return (
    <div 
      className={cn(
        "rounded-full border border-white/10 overflow-hidden shrink-0 relative p-[1.5px] bg-[#1c1b1b] hover:border-white/20 transition-all",
        currentSizeClass
      )}
    >
      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-[#131313]">
        {src ? (
          <img 
            src={src} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#c4c7c8]/60">
            <User className={currentIconSizeClass} />
          </div>
        )}
      </div>
    </div>
  );
};

export const OverlappingAvatars = ({ accounts, size = "sm" }: { accounts: any[], size?: "sm" | "md" }) => {
  const displayAccounts = accounts.slice(0, 3);
  const remaining = accounts.length - 3;
  const sizeClass = size === "sm" ? "w-6 h-6" : "w-8 h-8";
  const offsetClass = size === "sm" ? "-ml-2" : "-ml-3";

  return (
    <div className="flex items-center py-0.5">
      {displayAccounts.map((acc, idx) => (
        <div
          key={acc.id}
          className={cn(
            "rounded-full border border-white/10 overflow-hidden shrink-0 relative p-[1px] bg-[#1c1b1b]",
            sizeClass,
            idx > 0 && offsetClass
          )}
          style={{ zIndex: 10 - idx }}
        >
          <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-[#131313]">
            {acc.profile_picture_url ? (
              <img 
                src={acc.profile_picture_url} 
                alt={acc.username} 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className={size === "sm" ? "w-2.5 h-2.5" : "w-3.5 h-3.5"} />
            )}
          </div>
        </div>
      ))}
      {remaining > 0 && (
        <div 
          className={cn(
            "rounded-full border border-white/10 flex items-center justify-center bg-[#1c1b1b] text-[9px] font-black text-[#c4c7c8]/60",
            sizeClass,
            offsetClass
          )}
          style={{ zIndex: 0 }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};
