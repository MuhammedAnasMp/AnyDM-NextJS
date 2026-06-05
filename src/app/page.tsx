"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen selection:bg-black/10 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 border-b border-[#eaeaea] transition-all duration-300 ${
          scrolled ? "bg-white/90 backdrop-blur-md shadow-sm h-14" : "bg-[#ffffff] h-16"
        }`}
      >
        <nav className="max-w-[1152px] mx-auto px-6 flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-lg font-bold text-black tracking-tight hover:opacity-85 transition-opacity">
              AnyDM
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-[#5e5e5e] hover:text-black transition-colors duration-200">
                Features
              </a>
              <a href="#pricing" className="text-sm text-[#5e5e5e] hover:text-black transition-colors duration-200">
                Pricing
              </a>
              <a href="#" className="text-sm text-[#5e5e5e] hover:text-black transition-colors duration-200">
                About
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm text-[#5e5e5e] hover:text-black font-medium transition-colors duration-200"
            >
              Log In
            </Link>
            <Link 
              href="/signup" 
              className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-24 flex-1">
        {/* Hero Section */}
        <section className="max-w-[1152px] mx-auto px-6 py-20 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-[#eeeeee] rounded-full border border-[#eaeaea] mb-8"
          >
            <span className="text-[10px] font-semibold uppercase tracking-widest text-black">New Launch</span>
            <span className="text-[10px] text-[#5e5e5e]">v2.0 is now live</span>
          </motion.div>

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
            <Link 
              href="/signup" 
              className="text-white text-base font-semibold px-8 py-3.5 rounded-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center"
              style={{
                background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)"
              }}
            >
              Start Free Trial
            </Link>
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
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">UPTIME SLA</div>
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

        {/* Pricing Section */}
        <section className="max-w-[1152px] mx-auto px-6 py-20 bg-[#f3f3f3] rounded-3xl mb-20" id="pricing">
          <div className="text-center mb-16">
            <h2 className="text-[clamp(1.875rem,4vw,2.5rem)] font-extrabold text-black tracking-tight">
              Predictable Pricing
            </h2>
            <p className="text-lg text-[#5e5e5e] mt-2">
              No hidden fees. Scale as you grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Starter Plan */}
            <div className="bg-white p-8 rounded-xl border border-[#eaeaea] flex flex-col justify-between transition-all duration-300 hover:border-black">
              <div>
                <h4 className="text-xs font-bold text-[#5e5e5e] uppercase tracking-widest mb-4">Starter</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-black">$0</span>
                  <span className="text-[#5e5e5e] text-sm">/mo</span>
                </div>
                <p className="text-sm text-[#888888] mt-4">
                  Ideal for individuals just getting started with social sales.
                </p>
                <ul className="space-y-3 mt-8 text-sm text-[#5e5e5e]">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm font-bold text-black">check</span>
                    <span>100 Automations / mo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm font-bold text-black">check</span>
                    <span>Basic Analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm font-bold text-black">check</span>
                    <span>Email Support</span>
                  </li>
                </ul>
              </div>
              <Link 
                href="/signup" 
                className="mt-8 block w-full text-center border border-[#eaeaea] py-2.5 rounded-lg text-sm font-semibold hover:bg-[#f3f3f3] transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white p-8 rounded-xl border-2 border-black flex flex-col justify-between relative transition-all duration-300 shadow-xl md:scale-105">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                POPULAR
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#5e5e5e] uppercase tracking-widest mb-4">Professional</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-black">$49</span>
                  <span className="text-[#5e5e5e] text-sm">/mo</span>
                </div>
                <p className="text-sm text-[#888888] mt-4">
                  Power users managing high-volume social stores.
                </p>
                <ul className="space-y-3 mt-8 text-sm text-black font-semibold">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                    <span>Unlimited Automations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                    <span>Advanced Lead Scoring</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                    <span>Priority CRM Sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                    <span>Custom Node Logic</span>
                  </li>
                </ul>
              </div>
              <Link 
                href="/signup" 
                className="mt-8 block w-full text-center py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                style={{
                  background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)"
                }}
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white p-8 rounded-xl border border-[#eaeaea] flex flex-col justify-between transition-all duration-300 hover:border-black">
              <div>
                <h4 className="text-xs font-bold text-[#5e5e5e] uppercase tracking-widest mb-4">Enterprise</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-black">Custom</span>
                </div>
                <p className="text-sm text-[#888888] mt-4">
                  For large-scale operations requiring dedicated infra and SLA.
                </p>
                <ul className="space-y-3 mt-8 text-sm text-[#5e5e5e]">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm font-bold text-black">check</span>
                    <span>White-label Options</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm font-bold text-black">check</span>
                    <span>Dedicated Account Manager</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm font-bold text-black">check</span>
                    <span>Custom Security Audit</span>
                  </li>
                </ul>
              </div>
              <button className="mt-8 w-full border border-[#eaeaea] py-2.5 rounded-lg text-sm font-semibold hover:bg-[#f3f3f3] transition-colors">
                Contact Sales
              </button>
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
              href="/signup"
              className="bg-white text-black px-8 py-4 rounded-xl text-sm font-bold hover:scale-105 transition-all duration-200 relative z-10 shadow-md inline-block border border-white/10"
            >
              Start Your 14-Day Free Trial
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
            <a className="hover:text-black transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-black transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-black transition-colors" href="#">Support</a>
            <a className="hover:text-black transition-colors" href="#">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
