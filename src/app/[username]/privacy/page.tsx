"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, Mail } from "lucide-react";
import api from "@/lib/services/api.service";
import { getStoreHomeUrl } from "@/lib/utils/domain";
import { getTemplateStyles, TemplateStyle } from "@/components/templates/TemplateProvider";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ username: string }>;
}

interface StoreSettings {
  store_name?: string;
  store_logo?: string;
  template_id?: string;
  theme_id?: string;
  privacy_policy?: string;
  contact_email?: string;
}

const getDefaultPrivacySections = (storeName: string) => [
  {
    id: "introduction",
    title: "1. Introduction",
    paragraphs: [
      `This Privacy Policy explains how ${storeName} ("we", "us", or "our") collects, uses, and discloses your personal information when you visit, use our services, or make a purchase from our storefront.`,
      `By accessing or using our storefront services, you acknowledge that you have read and understood this Privacy Policy. If you do not agree with our practices, please refrain from using our store.`,
    ],
  },
  {
    id: "information-collection",
    title: "2. Information We Collect",
    paragraphs: [
      `We collect personal information that you voluntarily provide to us when placing an order or communicating with us:`,
      `• Contact Information: Full name, delivery shipping address, telephone number, and email address.`,
      `• Order & Transaction Details: Items purchased, order value, payment status, and order fulfillment status.`,
      `• Communications: Customer support inquiries, message history, and feedback provided regarding your purchase.`,
    ],
  },
  {
    id: "information-use",
    title: "3. How We Use Your Information",
    paragraphs: [
      `We use your personal information solely for legitimate operational and business purposes:`,
      `• Order Processing & Fulfillment: To pack, dispatch, and deliver your purchased products to your specified destination.`,
      `• Customer Support: To provide order updates, delivery tracking details, and answer your inquiries.`,
      `• Security & Fraud Prevention: To verify orders, detect suspicious activity, and maintain a safe shopping environment.`,
    ],
  },
  {
    id: "information-sharing",
    title: "4. Information Sharing & Disclosure",
    paragraphs: [
      `We do not sell, rent, or trade your personal information to third parties. We share data only with necessary service providers essential to fulfilling your orders:`,
      `• Logistics & Delivery Partners: Shipping carriers and courier providers to deliver your physical goods.`,
      `• Payment Processors: Secure payment gateways to process financial transactions.`,
      `• Legal Compliance: When required to comply with applicable laws, regulations, or valid legal requests.`,
    ],
  },
  {
    id: "your-rights",
    title: "5. Data Retention & Your Rights",
    paragraphs: [
      `We retain your order information for as long as necessary to fulfill the purposes outlined in this policy and comply with accounting or legal obligations.`,
      `You have the right to request access to the personal information we hold about you, request corrections to inaccurate data, or request deletion of your information where applicable by law.`,
    ],
  },
];

export default function PrivacyPolicyPage({ params }: PageProps) {
  const { username } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<StoreSettings>({});

  useEffect(() => {
    if (username) {
      api
        .get(`/accounts/public/store/${username}/`)
        .then((res) => {
          if (res.data?.settings) {
            setSettings(res.data.settings);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [username]);

  const styles: TemplateStyle = getTemplateStyles(
    settings.template_id || "glass_monochrome",
    settings.theme_id || "dark"
  );

  const storeName = settings.store_name || username;
  const customPolicy = settings.privacy_policy?.trim();

  const customSections = customPolicy
    ? customPolicy
        .split(/\n\s*\n/)
        .filter((block) => block.trim().length > 0)
        .map((block, index) => ({
          id: `section-${index + 1}`,
          title: `${index + 1}. Policy Details`,
          paragraphs: block.split("\n").map((line) => line.trim()),
        }))
    : null;

  const sections = customSections || getDefaultPrivacySections(storeName);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={cn("min-h-screen flex flex-col justify-between transition-colors duration-300 overflow-x-hidden", styles.bodyClass, styles.fontBody)}>
      {/* Navbar Header */}
      <header className={cn("sticky top-0 z-40 transition-all duration-300 px-4 sm:px-6 lg:px-8", styles.navClass)}>
        <div className={cn("flex items-center justify-between py-4 max-w-6xl mx-auto", styles.containerClass)}>
          <button
            onClick={() => router.push(getStoreHomeUrl(username))}
            className={cn(
              "inline-flex items-center gap-2 text-xs font-medium hover:opacity-80 transition-opacity",
              styles.textMutedClass
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to storefront</span>
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            {settings.store_logo && (
              <img
                src={settings.store_logo}
                alt={storeName}
                className="w-7 h-7 rounded-full object-cover border border-current/10 shrink-0"
              />
            )}
            <span className={cn("text-xs sm:text-sm font-semibold tracking-tight truncate", styles.textColorClass)}>
              {storeName}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-10 sm:py-16 flex-1 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* Document Title Header */}
        <div className="border-b pb-8 mb-10 transition-colors duration-300" style={{ borderColor: `${styles.accentColor}20` }}>
          <p className={cn("text-xs font-mono uppercase tracking-widest mb-2 opacity-60", styles.textMutedClass)}>
            Legal Document
          </p>
          <h1 className={cn("text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3", styles.fontHeadline, styles.textColorClass)}>
            Privacy Policy
          </h1>
          <p className={cn("text-xs sm:text-sm max-w-xl leading-relaxed", styles.textMutedClass)}>
            This document sets forth the privacy practices for <span className={cn("font-medium", styles.textColorClass)}>{storeName}</span>.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin opacity-50" />
            <p className={cn("text-xs font-medium", styles.textMutedClass)}>Loading document...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Sidebar Table of Contents (Desktop) */}
            <aside className="hidden lg:block lg:col-span-4 space-y-4 sticky top-24 self-start">
              <p className={cn("text-xs font-mono uppercase tracking-wider font-semibold opacity-50", styles.textMutedClass)}>
                On this page
              </p>
              <nav className="space-y-1.5 border-l pl-4" style={{ borderColor: `${styles.accentColor}20` }}>
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={cn(
                      "block text-xs text-left w-full truncate py-1 transition-colors hover:underline opacity-70 hover:opacity-100",
                      styles.textColorClass
                    )}
                  >
                    {sec.title}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Document Body */}
            <article className="lg:col-span-8 space-y-10">
              {sections.map((section) => (
                <section id={section.id} key={section.id} className="scroll-mt-28 space-y-3">
                  <h2 className={cn("text-lg sm:text-xl font-bold tracking-tight pb-2 border-b", styles.textColorClass)} style={{ borderColor: `${styles.accentColor}15` }}>
                    {section.title}
                  </h2>
                  <div className={cn("text-xs sm:text-sm leading-relaxed space-y-3 font-normal opacity-85", styles.textColorClass)}>
                    {section.paragraphs.map((p, idx) => (
                      <p key={idx} className="leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </div>
                </section>
              ))}

              {/* Contact Callout */}
              <div
                className={cn("p-6 sm:p-8 rounded-xl border mt-12 space-y-2", styles.cardClass)}
                style={{ borderColor: `${styles.accentColor}25` }}
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" style={{ color: styles.accentColor }} />
                  <h3 className={cn("text-xs sm:text-sm font-semibold tracking-wide", styles.textColorClass)}>
                    Questions regarding this policy?
                  </h3>
                </div>
                <p className={cn("text-xs leading-relaxed opacity-80", styles.textMutedClass)}>
                  If you have questions about how {storeName} manages customer data, please reach out to customer support at{" "}
                  <span className={cn("font-medium", styles.textColorClass)}>
                    {settings.contact_email || "store support"}
                  </span>.
                </p>
              </div>
            </article>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={cn("border-t py-8 transition-colors duration-300 px-4 sm:px-6 lg:px-8", styles.dividerClass)}>
        <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 text-xs max-w-6xl mx-auto", styles.textMutedClass)}>
          <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => router.push(getStoreHomeUrl(username))} className="hover:underline">
              Return to Storefront
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
