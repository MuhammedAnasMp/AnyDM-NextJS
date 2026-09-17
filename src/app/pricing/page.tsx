"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PricingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/#pricing");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
