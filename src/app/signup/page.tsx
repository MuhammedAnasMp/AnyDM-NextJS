"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import { authService } from "@/lib/services/auth.service";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import {
  Mail,
  Lock,
  ArrowRight,
  User,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "@/components/Toast";
import InstagramIcon from "@/components/ui/InstagramIcon";

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
    <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" />
    <path fill="#34A853" d="M16.04 18.013c-1.09.593-2.325.918-3.62.918-3.14 0-5.836-2.126-6.732-5.01L1.65 17.03C3.655 21.155 7.78 24 12.5 24c3.153 0 6.012-1.033 8.241-2.775l-4.702-3.212Z" />
    <path fill="#4285F4" d="M23.49 12.275c0-.85-.068-1.678-.19-2.475H12v4.612h6.446c-.28 1.487-1.12 2.747-2.38 3.588l4.702 3.212c2.747-2.541 4.341-6.275 4.341-10.275Z" />
    <path fill="#FBBC05" d="M5.688 13.921c-.24-.727-.375-1.503-.375-2.308 0-.828.14-1.626.398-2.368L1.685 6.13A11.968 11.968 0 0 0 0 11.613c0 1.996.488 3.876 1.347 5.535l4.341-3.227Z" />
  </svg>
);



function SignupContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isInstagramLoading, setIsInstagramLoading] = useState(false);
  const [error, setError] = useState("");
  const [toastType, setToastType] = useState<"error" | "success" | "info">("error");
  const router = useRouter();
  const searchParams = useSearchParams();

  const isAnyLoading = isGoogleLoading || isEmailLoading || isInstagramLoading;

  useEffect(() => {
    // Save referral code if present
    const refCode = searchParams.get("ref");
    if (refCode) {
      sessionStorage.setItem("referral_code", refCode);
    }

    // Handle Instagram OAuth code if present in URL
    const code = searchParams.get("code");
    if (code) {
      setIsInstagramLoading(true);
      const redirectUri = `${window.location.origin}/signup`;
      authService.exchangeInstagramCode(code, redirectUri, false)
        .then(() => {
          router.push("/dashboard");
        })
        .catch((err: any) => {
          console.error("Instagram exchange error:", err);
          const message = err.response?.data?.details || err.response?.data?.error || "Failed to connect Instagram. Please try again.";
          setError(message);
          setToastType("error");
        })
        .finally(() => {
          setIsInstagramLoading(false);
          // Clean URL parameter
          window.history.replaceState({}, "", "/signup");
        });
      return;
    }

    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/dashboard");
    });
    return () => unsubscribe();
  }, [router, searchParams]);

  const handleInstagramLogin = () => {
    setIsInstagramLoading(true);
    const clientId = "1454663269228644";
    const redirectUri = `${window.location.origin}/signup`;
    const scope = "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights";
    window.location.href = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&enable_fb_login=false`;
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError("");
    setToastType("error");
    try {
      await authService.loginWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      setError(authService.formatError(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (!agree) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    setIsEmailLoading(true);
    setError("");
    try {
      if (!auth) throw new Error("Firebase Auth is not initialized");
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Save display name to Firebase profile
      if (name.trim()) {
        await updateProfile(result.user, { displayName: name.trim() });
      }
      // Get fresh token (includes display name now)
      const idToken = await result.user.getIdToken(true);
      await authService.exchangeFirebaseToken(idToken);
      router.push("/dashboard");
    } catch (err: any) {
      setToastType("error");
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Ethereal background glows */}
      <div className="absolute top-[-300px] left-[-300px] w-[600px] h-[600px] rounded-full bg-[#c4c0ff]/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-300px] right-[-300px] w-[600px] h-[600px] rounded-full bg-white/5 blur-[120px] pointer-events-none"></div>

      <AnimatePresence>
        {error && (
          <Toast
            isVisible={!!error}
            message={error}
            type={toastType}
            onClose={() => setError("")}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[480px] glass-pane p-8 rounded-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-white text-3xl font-bold">hub</span>
            <span className="font-bold text-2xl tracking-tight text-white">AnyDM</span>
          </Link>
          <h2 className="text-xl font-bold text-white">Create your account</h2>
          <p className="text-sm text-[#c4c7c8]/60 mt-1">Get started with our 14-day free trial</p>
        </div>

        <form onSubmit={handleEmailSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#c4c7c8]/80 mb-2">Full Name</label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white transition-colors" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all placeholder:text-white/20"
                placeholder="Alex Rivera"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#c4c7c8]/80 mb-2">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all placeholder:text-white/20"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#c4c7c8]/80 mb-2">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all placeholder:text-white/20"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="rounded bg-transparent border-white/20 focus:ring-0 text-primary cursor-pointer accent-white"
              id="agree"
            />
            <label htmlFor="agree" className="text-xs text-[#c4c7c8]/60 cursor-pointer select-none">
              I agree to the <a href="#" className="text-white hover:underline">Terms of Service</a> and <a href="#" className="text-white hover:underline">Privacy Policy</a>
            </label>
          </div>

          <button
            type="submit"
            disabled={isAnyLoading}
            className="w-full bg-white text-black py-3 rounded-lg text-sm font-bold shadow-lg hover:bg-[#eaeaea] hover:scale-[1.01] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {isEmailLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-black" />
            ) : (
              <>
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <span className="relative bg-[#1a1a19] px-3 text-xs text-[#c4c7c8]/40 uppercase tracking-widest font-bold">or</span>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={isAnyLoading}
            className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-lg text-sm font-bold shadow-lg hover:bg-white/10 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
            {isGoogleLoading && <Loader2 className="w-4 h-4 animate-spin text-white ml-2" />}
          </button>

          <button
            onClick={handleInstagramLogin}
            disabled={isAnyLoading}
            className="w-full insta-gradient text-white py-3 rounded-lg text-sm font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <InstagramIcon className="w-5 h-5 mr-1" />
            <span>Continue with Instagram</span>
            {isInstagramLoading && <Loader2 className="w-4 h-4 animate-spin text-white ml-2" />}
          </button>
        </div>

        <p className="text-center text-sm text-[#c4c7c8]/40 mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-white font-semibold hover:underline">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#131313] text-white">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
