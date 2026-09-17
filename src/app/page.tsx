"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ArrowRight,
  BookOpen,
  Menu,
  X,
  ChevronDown,
  Zap,
  Layers,
  ShoppingBag,
  BarChart3,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { authService } from "@/lib/services/auth.service";
import { onAuthStateChanged } from "firebase/auth";
import api from "@/lib/services/api.service";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const GithubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export default function LandingPage() {
  const appUser = useSelector((state: RootState) => state.auth.user);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sysSettings, setSysSettings] = useState<any>(null);

  const showDashboard = mounted && isLoggedIn;

  useEffect(() => {
    setMounted(true);
    const fetchSettings = async () => {
      try {
        const res = await api.get("/accounts/settings/system/");
        setSysSettings(res.data);
      } catch (e) {
        console.error("Failed to load system settings on landing page:", e);
      }
    };
    fetchSettings();

    if (typeof window !== "undefined") {
      if (window.location.pathname === "/pricing" || window.location.hash === "#pricing") {
        setTimeout(() => {
          const el = document.getElementById("pricing");
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }, 150);
      }
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!auth) {
      setIsLoggedIn(false);
      setAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await user.getIdToken();
          setIsLoggedIn(true);
        } catch {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-[#fcfcfd] text-[#18181b] min-h-screen flex flex-col font-sans">
      {/* Top Production Notification Telemetry Bar (Light Mode) */}
      <div className="bg-[#f4f4f5] border-b border-zinc-200 text-[10.5px] py-1 px-4 text-center text-zinc-600 flex items-center justify-center gap-3 z-50">
        <div className="inline-flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-zinc-900">System Status:</span>
          <span className="text-emerald-600 font-bold">API Operational</span>
        </div>
        <span className="hidden sm:inline text-zinc-300">|</span>
        <span className="hidden sm:inline text-zinc-500 font-medium">Meta Verified &amp; Official Instagram Integration</span>
      </div>

      {/* Top Navigation Bar (Light Mode) */}
      <header
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-zinc-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] h-14"
          : "bg-white/80 backdrop-blur-md border-b border-zinc-200/60 h-14 sm:h-15"
          }`}
      >
        <nav className="max-w-[1240px] mx-auto px-4 sm:px-6 flex items-center justify-between h-full relative">
          {/* Left Brand Identity */}
          <div className="flex items-center gap-6 lg:gap-10">
            <Link href="/" className="flex items-center gap-2.5 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/log.png"
                alt="AnyDM Logo"
                className="w-8 h-8 object-contain shrink-0 group-hover:scale-105 transition-transform duration-200"
              />
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl text-black tracking-tight group-hover:opacity-80 transition-opacity">
                  AnyDM
                </span>

              </div>
            </Link>

            {/* Desktop Center Navigation Links */}
            <div className="hidden lg:flex items-center gap-7">
              {/* Mega-Menu Products Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setProductsOpen(true)}
                onMouseLeave={() => setProductsOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setProductsOpen(!productsOpen)}
                  className="text-xs font-bold text-zinc-600 hover:text-black flex items-center gap-1.5 py-2 transition-colors cursor-pointer"
                >
                  <span>Products</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${productsOpen ? "rotate-180 text-black" : ""}`} />
                </button>

                {/* Products Popover Mega Menu (Light Theme) */}
                <AnimatePresence>
                  {productsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-[480px] bg-white border border-zinc-200/90 rounded-2xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.08)] grid grid-cols-2 gap-2 z-50"
                    >
                      <Link
                        href={showDashboard ? "/dashboard/automations" : "/signup"}
                        className="p-3 rounded-xl hover:bg-zinc-50 transition-all group border border-transparent hover:border-zinc-200/60"
                      >
                        <div className="flex items-center gap-2.5 mb-1">
                          <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                            <Zap className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-zinc-900 group-hover:text-purple-700 transition-colors">
                            DM Automation
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-snug">
                          Instant keyword triggers &amp; automated Instagram replies.
                        </p>
                      </Link>

                      <Link
                        href={showDashboard ? "/dashboard/bio" : "/signup"}
                        className="p-3 rounded-xl hover:bg-zinc-50 transition-all group border border-transparent hover:border-zinc-200/60"
                      >
                        <div className="flex items-center gap-2.5 mb-1">
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                            <Layers className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-zinc-900 group-hover:text-indigo-700 transition-colors">
                            Link-in-Bio
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-snug">
                          Custom storefront, custom themes &amp; mobile link hub.
                        </p>
                      </Link>

                      <Link
                        href={showDashboard ? "/dashboard/products/website" : "/signup"}
                        className="p-3 rounded-xl hover:bg-zinc-50 transition-all group border border-transparent hover:border-zinc-200/60"
                      >
                        <div className="flex items-center gap-2.5 mb-1">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors">
                            Digital Storefront
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-snug">
                          Sell e-books, files, products &amp; services directly.
                        </p>
                      </Link>

                      <Link
                        href={showDashboard ? "/dashboard/analytics" : "/signup"}
                        className="p-3 rounded-xl hover:bg-zinc-50 transition-all group border border-transparent hover:border-zinc-200/60"
                      >
                        <div className="flex items-center gap-2.5 mb-1">
                          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                            <BarChart3 className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-zinc-900 group-hover:text-amber-700 transition-colors">
                            Analytics Studio
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-snug">
                          Real-time click statistics &amp; lead conversions.
                        </p>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <a href="#features" className="text-xs font-bold text-zinc-600 hover:text-black transition-colors">
                Features
              </a>

              <a href="/#pricing" className="text-xs font-bold text-zinc-600 hover:text-black transition-colors">
                Pricing
              </a>

              <Link
                href="/docs"
                className="text-xs font-bold text-zinc-600 hover:text-black transition-colors flex items-center gap-1.5 group"
              >
                <BookOpen className="w-3.5 h-3.5 text-zinc-500 group-hover:text-black transition-colors" />
                <span>Documentation</span>
                <span className="px-1.5 py-0.2 rounded bg-zinc-100 text-[9px] font-black text-zinc-700 border border-zinc-200 uppercase">
                  Docs
                </span>
              </Link>
            </div>
          </div>

          {/* Right Desktop CTAs */}
          <div className="flex items-center gap-3">
            {/* GitHub Star Badge */}
            <a
              href="https://github.com/anydm"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-800 transition-all shadow-2xs group hover:border-zinc-300"
              title="Star AnyDM on GitHub"
            >
              <GithubIcon className="w-4 h-4 text-zinc-900 group-hover:rotate-12 transition-transform" />
              <span>Star</span>
              <span className="px-1.5 py-0.2 rounded-full bg-zinc-100 text-[10px] font-mono text-zinc-600 border border-zinc-200">
                ★ 1.4k
              </span>
            </a>

            {/* Auth / Dashboard Button */}
            {!mounted || authLoading ? (
              <div className="h-9 w-24 rounded-md bg-zinc-200/80 animate-pulse border border-zinc-300/50" />
            ) : showDashboard ? (
              <Link
                href="/dashboard"
                className="relative group inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white rounded-md bg-black hover:bg-zinc-800 transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-bold text-zinc-600 hover:text-black px-3 py-2 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="relative group inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-md bg-black hover:bg-zinc-800 transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  <span>Start Free</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-800 hover:bg-zinc-200 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Dropdown Drawer (Light Mode) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-b border-zinc-200 px-4 py-4 space-y-4 shadow-xl overflow-hidden"
            >
              <div className="grid grid-cols-1 gap-2 border-b border-zinc-100 pb-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-2 mb-1">
                  Products &amp; Tools
                </div>
                <Link
                  href={showDashboard ? "/dashboard/automations" : "/signup"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-xs font-bold text-zinc-900 border border-zinc-100"
                >
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span>DM Automation</span>
                </Link>

                <Link
                  href={showDashboard ? "/dashboard/bio" : "/signup"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-xs font-bold text-zinc-900 border border-zinc-100"
                >
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Bio Link Storefront</span>
                </Link>

                <Link
                  href={showDashboard ? "/dashboard/products/catalog" : "/signup"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-xs font-bold text-zinc-900 border border-zinc-100"
                >
                  <ShoppingBag className="w-4 h-4 text-pink-600" />
                  <span>Digital Product Store</span>
                </Link>
              </div>

              <div className="flex flex-col gap-2">
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-bold text-zinc-700 px-2 py-1.5"
                >
                  Features
                </a>
                <a
                  href="/#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-bold text-zinc-700 px-2 py-1.5"
                >
                  Pricing
                </a>
                <Link
                  href="/docs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-bold text-zinc-700 px-2 py-1.5 flex items-center justify-between"
                >
                  <span>Documentation</span>
                  <span className="px-1.5 py-0.2 rounded bg-zinc-100 text-[9px] font-black text-zinc-600 border border-zinc-200 uppercase">
                    Docs
                  </span>
                </Link>
              </div>

              <div className="pt-1 flex items-center justify-between gap-3">
                {!mounted || authLoading ? (
                  <div className="w-full h-11 rounded-xl bg-zinc-200/80 animate-pulse border border-zinc-300/50" />
                ) : showDashboard ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full bg-black text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-md"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Go to Dashboard</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-1/2 text-center text-xs font-bold py-3 border border-zinc-200 rounded-xl text-zinc-800 bg-zinc-50"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-1/2 text-center text-xs font-extrabold py-3 bg-black text-white rounded-xl shadow-md flex items-center justify-center gap-1.5"
                    >
                      <span>Start Free</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-[1152px] mx-auto px-6 py-20 flex flex-col items-center text-center">

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[clamp(2.5rem,6vw,4rem)] leading-[1.05] text-black max-w-4xl mb-6 font-extrabold tracking-tight"
          >
            Scale your social commerce without limits.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg max-w-2xl mb-10 text-[#5e5e5e] leading-relaxed"
          >
            The precision-engineered automation tool for high-volume social storefronts. Convert DMs into revenue with zero friction.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            {!mounted || authLoading ? (
              <div className="h-[52px] w-[185px] rounded-lg bg-zinc-200/80 animate-pulse border border-zinc-300/50" />
            ) : (
              <Link
                href={showDashboard ? "/dashboard" : "/signup"}
                className="text-white text-base font-semibold px-8 py-3.5 rounded-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)"
                }}
              >
                <span>{showDashboard ? "Go to Dashboard" : "Start Free Trial"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <button className="border border-[#eaeaea] bg-white text-black px-8 py-3.5 rounded-lg text-base font-semibold hover:bg-[#f3f3f3] transition-colors duration-200">
              Book a Demo
            </button>
          </motion.div>

          {/* Hero Interface Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 w-full aspect-[2.12/1] rounded-xl overflow-hidden border border-[#eaeaea] bg-white shadow-xl relative"
          >
            <img
              alt="AnyDM Hero Interface Preview"
              className="w-full h-full object-cover grayscale-[15%] contrast-[1.05]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRxGy9WPJZmZgvcSzf797WpvzYiaKcYuRVAH3ow-hKlK5-F2rtV6yQBIzBRJrROcIhv4680TaiHnt2dhfYV5wx8cbQzpVPIYPj9fL88MhST1l-3nG1Phr5Gk6urmxJ5PnMTA9Yo7B1QxPc19WSRMDf5NxjPeEIFXn_nDWcnqhls_Bagb8vULrpt1AkDIiezmkIEvANpbh8Zs_oOT97jYPlzOoWmKEQ5DgtKLqYVoTb9OBTpRVrYGbzJILlXyLNtcnYIEXa-o1zxeE"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent pointer-events-none"></div>
          </motion.div>
        </section>

        {/* Bento Features Grid */}
        <section className="max-w-[1152px] mx-auto px-6 py-20 border-t border-[#eaeaea]" id="features">
          <div className="mb-12">
            <h2 className="text-[clamp(1.875rem,4vw,2.5rem)] font-extrabold text-black tracking-tight">
              High-Performance Features
            </h2>
            <p className="text-lg text-[#5e5e5e] mt-2">
              Built for technical dependability and razor-sharp precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Intelligent DM Automation */}
            <div className="md:col-span-8 bg-white border border-[#eaeaea] rounded-xl p-8 hover:border-black hover:bg-[#fcfcfc] transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="material-symbols-outlined text-black text-3xl">hub</span>
                  <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded">CORE</span>
                </div>
                <h3 className="text-lg font-bold text-black mb-2">Intelligent DM Automation</h3>
                <p className="text-sm text-[#5e5e5e] max-w-md">
                  Rule-based workflows that react to customer intent in milliseconds. Never miss a social lead again.
                </p>
              </div>
              <div className="mt-8 border-t border-[#eaeaea] pt-6 flex flex-wrap gap-3">
                {["Auto-Reply Logic", "Sentiment Filtering", "Custom Triggers"].map((item, i) => (
                  <div key={i} className="flex items-center gap-1 bg-[#eeeeee] px-3 py-1.5 rounded-lg border border-[#eaeaea] text-xs font-medium text-black">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time Analytics */}
            <div className="md:col-span-4 bg-black text-white rounded-xl p-8 flex flex-col justify-between">
              <div>
                <span className="material-symbols-outlined text-white text-3xl mb-4">bolt</span>
                <h3 className="text-lg font-bold">Real-time Analytics</h3>
                <p className="text-sm text-zinc-400 mt-2">
                  Live stream of conversion events and interaction density.
                </p>
              </div>
              <div className="mt-12">
                <div className="text-4xl font-extrabold tracking-tight">99.9%</div>
                <div className="text-[10px] text-zinc-500 font-bold tracking-wider mt-1">UPTIME SLA</div>
              </div>
            </div>

            {/* Lead Qualification */}
            <div className="md:col-span-4 bg-white border border-[#eaeaea] rounded-xl p-8 hover:border-black hover:bg-[#fcfcfc] transition-all duration-300">
              <span className="material-symbols-outlined text-black text-3xl mb-4">verified</span>
              <h3 className="text-lg font-bold text-black mb-2">Lead Qualification</h3>
              <p className="text-sm text-[#5e5e5e]">
                Automatically segment prospects by budget and intent using our proprietary scoring engine.
              </p>
            </div>

            {/* Technical Detail API First */}
            <div className="md:col-span-8 bg-[#f3f3f3] border border-[#eaeaea] rounded-xl p-8 hover:border-black transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 overflow-hidden">
              <div className="max-w-sm">
                <h3 className="text-lg font-bold text-black mb-2">API First Architecture</h3>
                <p className="text-sm text-[#5e5e5e]">
                  Integrate AnyDM into your existing CRM or custom fulfillment stack with our robust GraphQL API.
                </p>
              </div>
              <div className="font-mono text-xs text-[#888888] px-4 py-2 bg-white rounded border border-[#eaeaea] shrink-0">
                GET /v1/automation/nodes
              </div>
            </div>
          </div>
        </section>

        {/* Pricing & Creator Plans Section */}
        <section className="max-w-[1152px] mx-auto px-6 py-20 bg-[#f3f3f3] rounded-3xl mb-20" id="pricing">
          <div className="text-center mb-14">
            <span className="inline-block text-[11px] font-bold tracking-widest text-black uppercase px-3 py-1 bg-white border border-[#eaeaea] rounded-full mb-3 shadow-xs">
              Plans &amp; Creator Program
            </span>
            <h2 className="text-[clamp(1.875rem,4vw,2.5rem)] font-extrabold text-black tracking-tight">
              Simple, Predictable Plans
            </h2>
            <p className="text-sm text-[#5e5e5e] mt-2 max-w-lg mx-auto">
              Choose the right plan for your storefront or partner with us as an AnyDM Creator.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            {/* 1. Free Trial Plan */}
            <div className="bg-white p-6 rounded-2xl border border-[#eaeaea] flex flex-col justify-between transition-all duration-300 hover:border-black shadow-xs">
              <div>
                <span className="text-[10px] font-bold text-[#5e5e5e] tracking-widest uppercase block mb-3">Starter</span>
                <h3 className="text-base font-bold text-black">{sysSettings?.trial_days || 14}-Day Free Trial</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-black">₹0</span>
                  <span className="text-[#5e5e5e] text-xs font-semibold">/ {sysSettings?.trial_days || 14} days</span>
                </div>
                <p className="text-xs text-[#888888] mt-2 leading-relaxed">
                  Test out Instagram keyword replies and storefront tools. No credit card needed.
                </p>
                <ul className="space-y-2.5 mt-6 text-xs text-[#5e5e5e] font-medium border-t border-[#f0f0f0] pt-4">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-black">check</span>
                    <span>1 Connected Instagram Account</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-black">check</span>
                    <span>Keyword DMs &amp; Story Auto-Replies</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-black">check</span>
                    <span>Basic Store Catalog (5 items)</span>
                  </li>
                </ul>
              </div>
              <Link
                href={showDashboard ? "/dashboard" : "/signup"}
                className="mt-6 block w-full text-center border border-black py-2.5 rounded-xl text-xs font-bold hover:bg-[#f3f3f3] transition-colors"
              >
                {showDashboard ? "Go to Dashboard" : `Start ${sysSettings?.trial_days || 14}-Day Trial`}
              </Link>
            </div>

            {/* 2. Creator Pro Plan */}
            <div className="bg-white p-6 rounded-2xl border-2 border-black flex flex-col justify-between relative transition-all duration-300 shadow-lg md:scale-105">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-bold px-3 py-0.5 rounded-full tracking-wider">
                MOST POPULAR
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#5e5e5e] tracking-widest uppercase block mb-3">Full Suite</span>
                <h3 className="text-base font-bold text-black">Creator Pro</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-black">₹{sysSettings?.premium_plan_price !== undefined ? sysSettings.premium_plan_price : 499}</span>
                  <span className="text-[#5e5e5e] text-xs font-semibold">/ month</span>
                </div>
                <p className="text-xs text-[#888888] mt-2 leading-relaxed">
                  Full power operating system for creators, sellers, and growing social brands.
                </p>
                <ul className="space-y-2.5 mt-6 text-xs text-black font-semibold border-t border-[#f0f0f0] pt-4">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-black">check</span>
                    <span>Unlimited Instagram Accounts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-black">check</span>
                    <span>Unlimited AI Chatbots &amp; DM Loops</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-black">check</span>
                    <span>Full Product Catalog &amp; Orders</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-black">check</span>
                    <span>Interactive Spin-Wheel Games</span>
                  </li>
                </ul>
              </div>
              <Link
                href={showDashboard ? "/dashboard/pricing" : "/signup"}
                className="mt-6 block w-full text-center py-2.5 rounded-xl text-xs font-bold text-white hover:opacity-95 transition-opacity"
                style={{
                  background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)"
                }}
              >
                {showDashboard ? "Upgrade in Dashboard" : "Get Creator Pro"}
              </Link>
            </div>

            {/* 3. Creator Partner Program (Commission & VIP) */}
            <div className="bg-[#111111] text-white p-6 rounded-2xl border border-black flex flex-col justify-between transition-all duration-300 shadow-md">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase block mb-3">Partner Program</span>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <span>Creator Partner</span>
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-white">Earn Cash / VIP</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Refer your audience and earn cash rewards or complimentary Creator Pro access.
                </p>
                <ul className="space-y-2.5 mt-6 text-xs text-zinc-300 font-medium border-t border-white/10 pt-4">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-white">paid</span>
                    <span><strong>{sysSettings?.creator_commission_percent !== undefined ? sysSettings.creator_commission_percent : 10}% Commission</strong> on paid sales</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-white">account_balance</span>
                    <span>Direct Bank Payouts &amp; Real-Time Tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-white">card_membership</span>
                    <span>Option for <strong>VIP Free Pro Access</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-white">link</span>
                    <span>Custom Referral Link &amp; Creator Hub</span>
                  </li>
                </ul>
              </div>
              {showDashboard && appUser?.is_creator_vip ? (
                <Link
                  href="/dashboard/creator"
                  className="mt-6 block w-full text-center bg-white text-black py-2.5 rounded-xl text-xs font-bold hover:bg-[#eaeaea] transition-colors"
                >
                  Open Creator Hub
                </Link>
              ) : (
                <a
                  href="https://ig.me/m/anydm.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 block w-full text-center bg-white text-black py-2.5 rounded-xl text-xs font-bold hover:bg-[#eaeaea] transition-colors"
                >
                  Contact anydm.in
                </a>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-[1152px] mx-auto px-6 py-20 text-center">
          <div className="text-white rounded-3xl p-12 md:p-20 relative bg-black overflow-hidden">
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "24px 24px"
              }}
            ></div>
            <h2 className="text-[clamp(1.875rem,4vw,2.75rem)] font-extrabold mb-4 relative z-10 tracking-tight">
              Ready to automate your growth?
            </h2>
            <p className="text-zinc-400 text-base max-w-xl mx-auto mb-10 relative z-10 leading-relaxed">
              Join 2,000+ brands using AnyDM to handle their social interactions with clinical precision.
            </p>
            <Link
              href={showDashboard ? "/dashboard" : "/signup"}
              className="bg-white text-black px-8 py-4 rounded-xl text-sm font-bold hover:scale-105 transition-all duration-200 relative z-10 shadow-md inline-block border border-white/10"
            >
              {showDashboard ? "Go to Dashboard" : `Start Your ${sysSettings?.trial_days || 14}-Day Free Trial`}
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#eaeaea] py-12">
        <div className="max-w-[1152px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-sm font-bold text-black">AnyDM</span>
            <p className="text-xs text-[#888888]">© 2024 AnyDM Automation. All rights reserved.</p>
          </div>
          <div className="flex gap-6 items-center text-xs text-[#5e5e5e]">
            <Link className="hover:text-black transition-colors" href="/privacy">Privacy Policy</Link>
            <Link className="hover:text-black transition-colors" href="/terms">Terms of Service</Link>
            <a className="hover:text-black transition-colors" href="mailto:support@anydm.in">Support</a>
            <a className="hover:text-black transition-colors" href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
