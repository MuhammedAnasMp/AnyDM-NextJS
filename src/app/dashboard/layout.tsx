"use client";

import React, { useEffect, useState, Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { authService } from "@/lib/services/auth.service";
import { setHydrating } from "@/store/slices/authSlice";
import { cn } from "@/lib/utils";

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  const appUser = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const isBuilder = pathname === "/dashboard/automations" || pathname.startsWith("/dashboard/automations");
  const isFullBleed = isBuilder || pathname === "/dashboard/inbox";

  useEffect(() => {
    const handleOpenSidebar = () => setIsSidebarOpen(true);
    window.addEventListener("open-sidebar", handleOpenSidebar);
    return () => {
      window.removeEventListener("open-sidebar", handleOpenSidebar);
    };
  }, []);

  // 1. Monitor Firebase Auth State
  useEffect(() => {
    if (!auth) {
      dispatch(setHydrating(false));
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setFirebaseUser(currentUser);
      } else {
        dispatch(setHydrating(false));
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router, dispatch]);

  const instagramAccounts = useSelector((state: RootState) => state.auth.instagramAccounts);
  const hasIgCode = searchParams ? searchParams.get("code") : null;

  // 2. Hydrate Django Session & Instagram Accounts
  useEffect(() => {
    const hydrateSession = async () => {
      if (!firebaseUser) return;

      if (!appUser && !hasIgCode) {
        try {
          const idToken = await firebaseUser.getIdToken();
          await authService.exchangeFirebaseToken(idToken);
        } catch (error) {
          console.error("Session restoration failed:", error);
          dispatch(setHydrating(false));
        }
      } else {
        dispatch(setHydrating(false));
      }

      if (authService.getAccessToken() && instagramAccounts.length === 0) {
        await authService.getConnectedInstagramAccounts();
      }
    };

    hydrateSession();
  }, [firebaseUser, appUser, hasIgCode, instagramAccounts.length, dispatch]);

  return (
    <div className={cn("bg-[#131313] text-[#e5e2e1] relative", isFullBleed ? "h-screen overflow-hidden" : "min-h-screen")}>
      {/* Ethereal Background Accents */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#c4c0ff]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[100px] rounded-full"></div>
      </div>

      {/* Global Sidebar (Responsive Overlay on Mobile, Fixed Sidebar on Desktop) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area (ml-0 on Mobile, ml-[240px] on Desktop) */}
      <div className={cn(
        "lg:ml-[240px] flex flex-col relative z-10 transition-all duration-300",
        isFullBleed ? "h-screen overflow-hidden" : "min-h-screen"
      )}>
        {/* Two-Tier Dynamic Header */}
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Content Canvas — only render after Firebase resolves (~100ms) */}
        <main className={cn(
          "flex-1 w-full mx-auto",
          isFullBleed
            ? "flex flex-col flex-1 min-h-0 p-0 max-w-none overflow-hidden"
            : "w-full px-4 py-6 sm:px-6"
        )}>
          {firebaseUser ? children : null}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-white/20 border-t-white animate-spin"></div>
      </div>
    }>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
