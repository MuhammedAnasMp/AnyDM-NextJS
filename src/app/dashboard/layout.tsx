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
  const isHydrating = useSelector((state: RootState) => state.auth.isHydrating);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const isBuilder = pathname === "/dashboard/automations" || pathname.startsWith("/dashboard/automations");

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

  // 2. Hydrate Django Session & Instagram Accounts
  useEffect(() => {
    const hydrateSession = async () => {
      if (!firebaseUser) return;

      const hasIgCode = searchParams.get("code");

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

      if (authService.getAccessToken()) {
        await authService.getConnectedInstagramAccounts();
      }
    };

    hydrateSession();
  }, [firebaseUser, appUser, searchParams, dispatch]);

  if (isHydrating) {
    return (
      <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex flex-col items-center justify-center relative overflow-hidden font-sans">
        {/* Background glows */}
        <div className="absolute top-[-300px] left-[-300px] w-[600px] h-[600px] rounded-full bg-[#c4c0ff]/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-300px] right-[-300px] w-[600px] h-[600px] rounded-full bg-white/5 blur-[120px] pointer-events-none"></div>
        
        <div className="glass-pane p-8 rounded-2xl flex flex-col items-center gap-4 relative z-10">
          <div className="w-10 h-10 rounded-full border-4 border-white/20 border-t-white animate-spin"></div>
          <p className="text-sm font-semibold tracking-tight text-white/80">Securing environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-[#131313] text-[#e5e2e1] relative", isBuilder ? "h-screen overflow-hidden" : "min-h-screen")}>
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
        isBuilder ? "h-screen overflow-hidden" : "min-h-screen"
      )}>
        {/* Two-Tier Dynamic Header */}
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Content Canvas (p-4 on Mobile, p-8 on Desktop) */}
        <main className={cn(
          "flex-1 w-full mx-auto",
          isBuilder ? "min-h-0 p-0 max-w-none overflow-hidden" : "max-w-[1440px] p-4 md:p-6 lg:p-8"
        )}>
          {children}
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
