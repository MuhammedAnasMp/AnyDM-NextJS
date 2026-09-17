"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Mail } from "lucide-react";

export default function TermsOfServicePage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-white font-medium mb-4">
            <FileText className="w-3.5 h-3.5 text-white/80" />
            Terms & Conditions
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Terms of Service</h1>
          <p className="text-sm text-[#c4c7c8]/70 mt-2">
            Last Updated: September 16, 2026 • Effective Date: Immediate
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-sm leading-relaxed text-[#c4c7c8]/90">
          <section className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-white/80" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, registering, or using the AnyDM platform (“Service”), you agree to be bound by these Terms of Service. 
              If you do not agree with any portion of these terms, you must not access or use the platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white">2. Description of Service & Automation Guidelines</h2>
            <p>
              AnyDM provides direct message automation, AI conversational reply tools, link-in-bio creation, and creator partner management tools for social media creators and merchants.
            </p>
            <p>
              You agree to use automation features in strict compliance with social platform policies (including Meta & Instagram Community Guidelines). You must not send spam, unauthorized promotional messages, or abusive content using our platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white">3. User Accounts & Security</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white">4. Subscriptions, Pricing & Creator Programs</h2>
            <ul className="list-disc pl-5 space-y-2 text-[#c4c7c8]/80">
              <li>
                <strong className="text-white">Free Trial & Subscriptions:</strong> Free trial accounts provide access for the designated trial period (e.g. 14 days). Paid plans renew automatically unless cancelled before the renewal date.
              </li>
              <li>
                <strong className="text-white">Creator Partner Rewards & Commissions:</strong> Creator VIP plans and referral commission rewards are governed by active plan status. As stipulated in creator guidelines, if a creator’s VIP program expires, reward accruals are paused until the account is renewed or reactivated.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white">5. Prohibited Activities</h2>
            <p>You agree not to engage in any of the following prohibited behaviors:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-[#1c1b1b] border border-white/10 p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Spam & Unsolicited DMs
                </h3>
                <p className="text-xs text-[#c4c7c8]/70">Using AnyDM to broadcast unwanted commercial messages or violate platform rates.</p>
              </div>
              <div className="bg-[#1c1b1b] border border-white/10 p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Illegal or Harmful Content
                </h3>
                <p className="text-xs text-[#c4c7c8]/70">Distributing fraudulent, illegal, or trademark-infringing materials via storefronts or DMs.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white">6. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, AnyDM and its affiliates shall not be liable for any indirect, incidental, or consequential damages resulting from platform downtime, social network API changes, or unauthorized access to account credentials.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-white/80" />
              Questions or Concerns?
            </h2>
            <p className="text-xs text-[#c4c7c8]/80">
              For any questions or clarification regarding our Terms of Service, please contact our support team:
            </p>
            <p className="text-sm font-semibold text-white">Email: terms@anydm.in • support@zoyee.in</p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#131313] py-8 text-xs text-[#c4c7c8]/60 mt-12">
        <div className="max-w-[900px] mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 AnyDM / Zoyee. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-white font-semibold underline">Terms of Service</Link>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
