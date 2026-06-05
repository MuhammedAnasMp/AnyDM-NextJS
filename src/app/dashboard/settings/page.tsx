"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/settings/accounts");
  }, [router]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-white/20 border-t-white animate-spin"></div>
    </div>
  );
}
