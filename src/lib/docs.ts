import { DOCS_CONTENT_MAP } from "./docs-content";

export interface DocNavItem {
  title: string;
  slug: string;
  href: string;
  appUrl: string;
  description?: string;
  children?: DocNavItem[];
}

export interface DocSection {
  title: string;
  iconName: string;
  slug: string;
  href: string;
  appUrl: string;
  items: DocNavItem[];
}

export interface DocHeading {
  id: string;
  text: string;
  level: number;
}

export interface DocArticle {
  slug: string[];
  fullSlug: string;
  title: string;
  description: string;
  appUrl: string;
  content: string;
  headings: DocHeading[];
  previous?: { title: string; href: string };
  next?: { title: string; href: string };
  sectionTitle?: string;
}

export interface DocSearchResult {
  title: string;
  description: string;
  href: string;
  section: string;
  snippet?: string;
}

/**
 * The canonical Documentation Navigation hierarchy matching Sidebar.tsx order exactly
 */
export const DOCS_NAVIGATION: DocSection[] = [
  {
    title: "Dashboard",
    iconName: "LayoutDashboard",
    slug: "dashboard",
    href: "/docs/dashboard",
    appUrl: "/dashboard",
    items: [
      {
        title: "Overview",
        slug: "dashboard",
        href: "/docs/dashboard",
        appUrl: "/dashboard",
        description: "Account health, hourly DM limits, live activity stream, and conversion funnel.",
      },
    ],
  },
  {
    title: "Link-in-Bio",
    iconName: "Link2",
    slug: "bio",
    href: "/docs/bio",
    appUrl: "/dashboard/bio",
    items: [
      {
        title: "Overview",
        slug: "bio",
        href: "/docs/bio",
        appUrl: "/dashboard/bio",
        description: "Mobile creator profile, handles, live device preview, and sharing.",
      },
      {
        title: "Blocks & Links",
        slug: "bio/blocks",
        href: "/docs/bio/blocks",
        appUrl: "/dashboard/bio",
        description: "Add, reorder, and manage interactive link cards, products, and media.",
      },
      {
        title: "Themes & Styling",
        slug: "bio/styling",
        href: "/docs/bio/styling",
        appUrl: "/dashboard/bio",
        description: "Preset themes, custom background colors, image wallpapers, and overlays.",
      },
      {
        title: "Social Accounts",
        slug: "bio/social",
        href: "/docs/bio/social",
        appUrl: "/dashboard/bio",
        description: "Connect Instagram, YouTube, TikTok, WhatsApp, and custom social channels.",
      },
      {
        title: "Smart Redirects",
        slug: "bio/redirects",
        href: "/docs/bio/redirects",
        appUrl: "/dashboard/bio",
        description: "Intelligent Reel keyword and promo URL resolver routing.",
      },
      {
        title: "Analytics & QR Code",
        slug: "bio/analytics",
        href: "/docs/bio/analytics",
        appUrl: "/dashboard/bio",
        description: "Visitor view counts, link clicks, CTR, and downloadable vector QR codes.",
      },
    ],
  },
  {
    title: "Automations",
    iconName: "Zap",
    slug: "automations",
    href: "/docs/automations/catalog",
    appUrl: "/dashboard/automation",
    items: [
      {
        title: "Automations Catalog",
        slug: "automations/catalog",
        href: "/docs/automations/catalog",
        appUrl: "/dashboard/automation",
        description: "Manage, filter, toggle active state, and track execution counts of reply rules.",
      },
      {
        title: "Visual Flow Builder",
        slug: "automations/builder",
        href: "/docs/automations/builder",
        appUrl: "/dashboard/automations",
        description: "Node canvas with Trigger, Condition, and Action nodes plus interactive phone simulator.",
      },
    ],
  },
  {
    title: "Schedule Posts",
    iconName: "CalendarClock",
    slug: "schedule",
    href: "/docs/schedule",
    appUrl: "/dashboard/schedule",
    items: [
      {
        title: "Post Scheduler & Publisher",
        slug: "schedule",
        href: "/docs/schedule",
        appUrl: "/dashboard/schedule",
        description: "Schedule Instagram Reels, Carousels, Stories, and images with AI caption generation.",
      },
    ],
  },
  {
    title: "Products",
    iconName: "Package",
    slug: "products",
    href: "/docs/products/catalog",
    appUrl: "/dashboard/products/catalog",
    items: [
      {
        title: "Product Catalog",
        slug: "products/catalog",
        href: "/docs/products/catalog",
        appUrl: "/dashboard/products/catalog",
        description: "Manage digital downloads, physical items, courses, services, and Instagram imports.",
      },
      {
        title: "Create & Edit Product",
        slug: "products/create",
        href: "/docs/products/create",
        appUrl: "/dashboard/products/catalog/create",
        description: "Configure pricing, discounts, media galleries, and digital download assets.",
      },
      {
        title: "Orders & Fulfillment",
        slug: "products/orders",
        href: "/docs/products/orders",
        appUrl: "/dashboard/products/orders",
        description: "Customer orders, payment statuses, buyer details, and fulfillment logs.",
      },
      {
        title: "Quick Replies",
        slug: "products/replies",
        href: "/docs/products/replies",
        appUrl: "/dashboard/products/replies",
        description: "Map products to automated comment triggers and direct message checkout cards.",
      },
      {
        title: "Creator Storefront",
        slug: "products/website",
        href: "/docs/products/website",
        appUrl: "/dashboard/products/website",
        description: "Customize your standalone e-commerce website, brand logo, and featured products.",
      },
    ],
  },
  {
    title: "Inbox",
    iconName: "MessageSquare",
    slug: "inbox",
    href: "/docs/inbox/chat",
    appUrl: "/dashboard/inbox",
    items: [
      {
        title: "Live Chat & DMs",
        slug: "inbox/chat",
        href: "/docs/inbox/chat",
        appUrl: "/dashboard/inbox",
        description: "Unified Instagram DM inbox, media attachments, quick replies, and bot takeover mode.",
      },
      {
        title: "Broadcast Direct Messages",
        slug: "inbox/broadcast",
        href: "/docs/inbox/broadcast",
        appUrl: "/dashboard/inbox/broadcast",
        description: "Send targeted mass DM announcements to audience segments and past buyers.",
      },
      {
        title: "Contacts CRM & Leads",
        slug: "inbox/contacts",
        href: "/docs/inbox/contacts",
        appUrl: "/dashboard/inbox/contacts",
        description: "Lead directory, interaction counters, lead scores, and 24h messaging window timers.",
      },
    ],
  },
  {
    title: "Refer & Earn",
    iconName: "Gift",
    slug: "refer",
    href: "/docs/refer",
    appUrl: "/dashboard/refer",
    items: [
      {
        title: "Referral Program & Points",
        slug: "refer",
        href: "/docs/refer",
        appUrl: "/dashboard/refer",
        description: "Custom invite links, point rewards, and 100-point redemptions for Free Creator Pro.",
      },
    ],
  },
  {
    title: "Creator Hub",
    iconName: "DollarSign",
    slug: "creator",
    href: "/docs/creator",
    appUrl: "/dashboard/creator",
    items: [
      {
        title: "Creator VIP & Commissions",
        slug: "creator",
        href: "/docs/creator",
        appUrl: "/dashboard/creator",
        description: "Affiliate revenue sharing (10%), earnings balance, and bank payout requests.",
      },
    ],
  },
  {
    title: "Pricing",
    iconName: "CreditCard",
    slug: "pricing",
    href: "/docs/pricing",
    appUrl: "/dashboard/pricing",
    items: [
      {
        title: "Plans & Subscriptions",
        slug: "pricing",
        href: "/docs/pricing",
        appUrl: "/dashboard/pricing",
        description: "Free Trial vs. Creator Pro features, Razorpay checkout, and subscription renewals.",
      },
    ],
  },
  {
    title: "Settings",
    iconName: "Settings",
    slug: "settings",
    href: "/docs/settings/accounts",
    appUrl: "/dashboard/settings/accounts",
    items: [
      {
        title: "Connected Accounts",
        slug: "settings/accounts",
        href: "/docs/settings/accounts",
        appUrl: "/dashboard/settings/accounts",
        description: "Manage Instagram Professional profiles, Meta tokens, and Google SSO logins.",
      },
      {
        title: "Workspace Settings",
        slug: "settings/workspace",
        href: "/docs/settings/workspace",
        appUrl: "/dashboard/settings/workspace",
        description: "Organization branding, workspace name, and team seat capacity.",
      },
      {
        title: "Seller KYC Verification",
        slug: "settings/kyc",
        href: "/docs/settings/kyc",
        appUrl: "/dashboard/settings/kyc",
        description: "Submit legal PAN, Aadhaar, and receiving bank account details for payouts.",
      },
      {
        title: "AI Agent Configuration",
        slug: "settings/ai",
        href: "/docs/settings/ai",
        appUrl: "/dashboard/settings/ai",
        description: "Define AI persona, store hours, return policies, and master AI token access.",
      },
    ],
  },
  {
    title: "Admin Panel",
    iconName: "ShieldAlert",
    slug: "admin",
    href: "/docs/admin/overview",
    appUrl: "/dashboard/admin",
    items: [
      {
        title: "System Overview",
        slug: "admin/overview",
        href: "/docs/admin/overview",
        appUrl: "/dashboard/admin",
        description: "Configure global plan pricing, referral point rules, and grant VIP Pro access.",
      },
      {
        title: "User Management",
        slug: "admin/users",
        href: "/docs/admin/users",
        appUrl: "/dashboard/admin/users",
        description: "Search users, adjust points balance, modify subscription durations, and manage staff.",
      },
      {
        title: "Verify KYC Queue",
        slug: "admin/verify-kyc",
        href: "/docs/admin/verify-kyc",
        appUrl: "/dashboard/admin/verify-kyc",
        description: "Review and approve or reject seller tax and bank account submissions.",
      },
      {
        title: "Payment Settlement",
        slug: "admin/payment-settlement",
        href: "/docs/admin/payment-settlement",
        appUrl: "/dashboard/admin/payment-settlement",
        description: "Disburse seller sales balances and creator affiliate payout withdrawals.",
      },
      {
        title: "Order Settings",
        slug: "admin/order-settings",
        href: "/docs/admin/order-settings",
        appUrl: "/dashboard/admin/order-settings",
        description: "Platform commission fees, payment gateway passing rules, and GST rates.",
      },
      {
        title: "Reference Specification",
        slug: "admin/spec",
        href: "/docs/admin/spec",
        appUrl: "/dashboard/admin/docs",
        description: "Definitive system spec for membership models, point economics, and raw markdown export.",
      },
    ],
  },
];

/**
 * Flattens all documentation articles in order for prev/next and routing resolution
 */
export function getAllDocArticles(): DocNavItem[] {
  const articles: DocNavItem[] = [];
  for (const section of DOCS_NAVIGATION) {
    for (const item of section.items) {
      articles.push(item);
    }
  }
  return articles;
}

/**
 * Extracts table-of-contents headings (H2, H3) from raw Markdown
 */
export function extractHeadings(markdown: string): DocHeading[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: DocHeading[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    headings.push({ id, text, level });
  }

  return headings;
}

/**
 * Extracts the first H1 title from Markdown
 */
function extractTitle(markdown: string, fallback: string): string {
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1].trim() : fallback;
}

/**
 * Extracts the lead paragraph following the H1 as a description
 */
function extractDescription(markdown: string, fallback: string): string {
  const lines = markdown.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("# ")) {
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim();
        if (
          nextLine &&
          !nextLine.startsWith("#") &&
          !nextLine.startsWith(">") &&
          !nextLine.startsWith("![") &&
          !nextLine.startsWith("|") &&
          !nextLine.startsWith("-")
        ) {
          return nextLine.replace(/[*_`]/g, "");
        }
      }
    }
  }
  return fallback;
}

/**
 * Loads and parses a single doc article from DOCS_CONTENT_MAP
 */
export function getDocArticleBySlug(slugArray: string[]): DocArticle | null {
  const fullSlug = slugArray.join("/");
  const rawContent = DOCS_CONTENT_MAP[fullSlug] || DOCS_CONTENT_MAP[`${fullSlug}/index`];

  if (!rawContent) return null;

  const allArticles = getAllDocArticles();
  const currentIndex = allArticles.findIndex((a) => a.slug === fullSlug);

  const navItem = allArticles[currentIndex] || {
    title: "Documentation",
    slug: fullSlug,
    href: `/docs/${fullSlug}`,
    appUrl: "/dashboard",
    description: "",
  };

  const title = extractTitle(rawContent, navItem.title);
  const description = extractDescription(rawContent, navItem.description || "");
  const headings = extractHeadings(rawContent);

  const section = DOCS_NAVIGATION.find((s) => s.items.some((item) => item.slug === fullSlug));

  const previous = currentIndex > 0 ? {
    title: allArticles[currentIndex - 1].title,
    href: allArticles[currentIndex - 1].href,
  } : undefined;

  const next = currentIndex >= 0 && currentIndex < allArticles.length - 1 ? {
    title: allArticles[currentIndex + 1].title,
    href: allArticles[currentIndex + 1].href,
  } : undefined;

  return {
    slug: slugArray,
    fullSlug,
    title,
    description,
    appUrl: navItem.appUrl,
    content: rawContent,
    headings,
    previous,
    next,
    sectionTitle: section?.title,
  };
}

/**
 * Searches across all documentation markdown files
 */
export function searchDocs(query: string): DocSearchResult[] {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  const results: DocSearchResult[] = [];
  const allArticles = getAllDocArticles();

  for (const article of allArticles) {
    const content = DOCS_CONTENT_MAP[article.slug] || DOCS_CONTENT_MAP[`${article.slug}/index`];
    if (!content) continue;

    const contentLower = content.toLowerCase();
    const titleLower = article.title.toLowerCase();
    const descLower = (article.description || "").toLowerCase();

    const titleMatch = titleLower.includes(q);
    const descMatch = descLower.includes(q);
    const contentMatch = contentLower.includes(q);

    if (titleMatch || descMatch || contentMatch) {
      let snippet = article.description || "";
      if (contentMatch && !titleMatch && !descMatch) {
        const matchIndex = contentLower.indexOf(q);
        const start = Math.max(0, matchIndex - 40);
        const end = Math.min(content.length, matchIndex + 100);
        snippet = "..." + content.substring(start, end).replace(/[#*`_>|]/g, "").trim() + "...";
      }

      const section = DOCS_NAVIGATION.find((s) => s.items.some((item) => item.slug === article.slug));

      results.push({
        title: article.title,
        description: snippet,
        href: article.href,
        section: section?.title || "Documentation",
      });
    }
  }

  return results;
}
