"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText, Mail } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-300px] left-[-300px] w-[600px] h-[600px] rounded-full bg-[#c4c0ff]/10 blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-300px] right-[-300px] w-[600px] h-[600px] rounded-full bg-white/5 blur-[140px] pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="border-b border-white/10 bg-[#131313]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1000px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/logo_white.png" alt="AnyDM Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg text-white tracking-wide">AnyDM</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-[#c4c7c8]/80 hover:text-white transition-colors bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-[900px] mx-auto px-6 py-12 relative z-10">
        {/* Header section */}
        <div className="mb-10 text-center sm:text-left border-b border-white/10 pb-8">
          {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-white font-medium mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-[#86efac]" />
            Legal & Data Protection
          </div> */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-[#c4c7c8]/70 mt-2">
            Last Updated: September 16, 2026 • Effective Date: Immediate
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-sm leading-relaxed text-[#c4c7c8]/90">
          <section className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-white/80" />
              1. Overview & Commitment
            </h2>
            <p>
              At AnyDM (“we”, “us”, or “our”), we respect your privacy and are committed to safeguarding your personal data.
              This Privacy Policy explains how we collect, use, process, and disclose information when you access our platform, use our automated direct message features, or register as a creator or merchant.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white">2. Information We Collect</h2>
            <p>We collect information in three primary ways:</p>
            <ul className="list-disc pl-5 space-y-2 text-[#c4c7c8]/80">
              <li>
                <strong className="text-white">Account & Profile Details:</strong> When you register, we collect your name, email address, profile avatar, and login credentials (or Google/Instagram OAuth tokens).
              </li>
              <li>
                <strong className="text-white">Social Media & Integration Data:</strong> When you connect your Instagram Business account via official Meta APIs, we access basic profile info, page IDs, direct messages received on connected business channels, and engagement triggers to perform requested automations.
              </li>
              <li>
                <strong className="text-white">Payment & Billing Information:</strong> Payment details (e.g. Razorpay transaction IDs, payment statuses) are processed securely through our payment gateways. We do not store raw credit card credentials on our servers.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white">3. How We Use Your Data</h2>
            <p>We use the collected information for the following legitimate business purposes:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-[#1c1b1b] border border-white/10 p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-1">Automation Services</h3>
                <p className="text-xs text-[#c4c7c8]/70">Executing keyword triggers, auto-replies, and AI direct message assistance requested by your account.</p>
              </div>
              <div className="bg-[#1c1b1b] border border-white/10 p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-1">Account & Analytics</h3>
                <p className="text-xs text-[#c4c7c8]/70">Managing subscriptions, creator commission payout calculation, and calculating platform performance metrics.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white">4. Meta & Third-Party API Integrations</h2>
            <p>
              AnyDM utilizes official Meta Graph APIs for Instagram direct messaging integrations. Data received from Meta APIs is strictly used to fulfill user-requested features. We do not sell, rent, or trade your social media messages, contact details, or follower lists to external advertisers or third parties.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white">5. Security & Data Retention</h2>
            <p>
              We implement industry-standard encryption protocols (TLS/SSL) for all data in transit and robust access controls for data at rest. Account data is retained as long as your account remains active. You may request account deletion or data removal at any time by contacting support.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white">6. Your Data Rights</h2>
            <p>
              You have the right to access, update, or delete your personal data stored within AnyDM. You can also disconnect social channel integrations at any time from your Account Settings or Meta App Settings.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-white/80" />
              Contact Us Regarding Privacy
            </h2>
            <p className="text-xs text-[#c4c7c8]/80">
              If you have any questions, concerns, or requests regarding this Privacy Policy or your data protection, please reach out to our privacy team:
            </p>
            <p className="text-sm font-semibold text-white">Email: privacy@anydm.in • support@zoyee.in</p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#131313] py-8 text-xs text-[#c4c7c8]/60 mt-12">
        <div className="max-w-[900px] mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 AnyDM / Zoyee. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="text-white font-semibold underline">Privacy Policy</Link>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
