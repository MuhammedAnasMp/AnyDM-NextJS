"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function InboxRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const paramsString = searchParams ? searchParams.toString() : "";
    const targetUrl = paramsString ? `/dashboard/inbox/chats?${paramsString}` : "/dashboard/inbox/chats";
    router.replace(targetUrl);
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] text-white/50 text-xs">
      Redirecting to Inbox Chats...
    </div>
  );
}
