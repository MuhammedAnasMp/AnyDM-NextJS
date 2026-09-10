import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Marked } from "marked";
import {
  getDocArticleBySlug,
  getAllDocArticles,
} from "@/lib/docs";
import DocsTableOfContents from "@/components/docs/DocsTableOfContents";
import DocsViewInApp from "@/components/docs/DocsViewInApp";
import {
  ChevronRight,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

/**
 * Generate Static Paths for all documented pages
 */
export async function generateStaticParams() {
  const articles = getAllDocArticles();
  return articles.map((art) => ({
    slug: art.slug.split("/"),
  }));
}

/**
 * Generate dynamic SEO Metadata
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocArticleBySlug(slug);

  if (!doc) {
    return {
      title: "Page Not Found | AnyDM Documentation",
    };
  }

  return {
    title: `${doc.title} | AnyDM Documentation`,
    description: doc.description,
    openGraph: {
      title: `${doc.title} | AnyDM Documentation`,
      description: doc.description,
      type: "article",
      url: `/docs/${slug.join("/")}`,
    },
    alternates: {
      canonical: `/docs/${slug.join("/")}`,
    },
  };
}

/**
 * Dynamic Documentation Page Component with 3-Column Layout & # Anchor Navigation
 */
export default async function DocArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const doc = getDocArticleBySlug(slug);

  if (!doc) {
    notFound();
  }

  // Parse markdown into HTML with custom heading renderer for IDs and # anchor permalinks
  const customMarked = new Marked();
  customMarked.use({
    renderer: {
      heading({ tokens, depth, text }: { tokens: any[]; depth: number; text: string }) {
        const inlineHtml = this.parser.parseInline(tokens);
        const cleanId = text
          .toLowerCase()
          .replace(/<[^>]*>/g, "")
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");

        if (depth === 1) {
          return `<h1 id="${cleanId}">${inlineHtml}</h1>\n`;
        }

        return `<h${depth} id="${cleanId}" class="scroll-mt-20 group flex items-center justify-between">
          <span>${inlineHtml}</span>
          <a href="#${cleanId}" class="ml-2 text-[#8e9192] opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#c4c0ff] text-sm font-mono font-normal no-underline px-1.5 py-0.5 rounded hover:bg-[#20201f]" title="Direct link to ${text}" aria-label="Permalink to ${text}">#</a>
        </h${depth}>\n`;
      },
    },
  });

  const renderedHtml = await customMarked.parse(doc.content, { gfm: true, breaks: true });

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
      <div className="flex justify-between gap-8 xl:gap-12">
        {/* Center Portion: Detailed Documentation Content */}
        <article className="flex-1 min-w-0 max-w-4xl mx-auto xl:mx-0">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-1.5 text-xs text-[#8e9192] mb-4">
            <Link href="/docs" className="hover:text-[#e5e2e1] transition-colors">
              Docs
            </Link>
            <ChevronRight className="w-3 h-3 text-[#444748]" />
            {doc.sectionTitle && (
              <>
                <span className="text-[#8e9192]">{doc.sectionTitle}</span>
                <ChevronRight className="w-3 h-3 text-[#444748]" />
              </>
            )}
            <span className="text-[#c4c0ff] font-medium truncate">{doc.title}</span>
          </nav>

          {/* View in Application Banner */}
          <DocsViewInApp appUrl={doc.appUrl} title={doc.title} />

          {/* Rendered Markdown Body */}
          <div
            className="docs-prose text-[#e5e2e1] mt-6"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />

          {/* Previous / Next Article Pagination */}
          <div className="mt-12 pt-6 border-t border-[#20201f] grid grid-cols-1 sm:grid-cols-2 gap-4">
            {doc.previous ? (
              <Link
                href={doc.previous.href}
                className="flex flex-col p-4 rounded-lg bg-[#1c1b1b] border border-[#2a2a2a] hover:border-[#444748] transition-all group text-left"
              >
                <div className="flex items-center gap-1 text-[10px] text-[#8e9192] uppercase tracking-wider mb-1 font-semibold">
                  <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Previous</span>
                </div>
                <span className="text-xs font-semibold text-[#e5e2e1] group-hover:text-white truncate">
                  {doc.previous.title}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {doc.next ? (
              <Link
                href={doc.next.href}
                className="flex flex-col p-4 rounded-lg bg-[#1c1b1b] border border-[#2a2a2a] hover:border-[#444748] transition-all group text-right sm:items-end"
              >
                <div className="flex items-center gap-1 text-[10px] text-[#8e9192] uppercase tracking-wider mb-1 font-semibold">
                  <span>Next</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="text-xs font-semibold text-[#e5e2e1] group-hover:text-white truncate">
                  {doc.next.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </article>

        {/* Right Section: Sticky Table of Contents with # Navigation */}
        <aside className="hidden xl:block w-64 shrink-0 sticky top-20 self-start pl-6 border-l border-[#20201f] max-h-[calc(100vh-6rem)] overflow-y-auto">
          <DocsTableOfContents headings={doc.headings} appUrl={doc.appUrl} />
        </aside>
      </div>
    </div>
  );
}
