import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { marked } from "marked";
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
 * Dynamic Documentation Page Component
 */
export default async function DocArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const doc = getDocArticleBySlug(slug);

  if (!doc) {
    notFound();
  }

  // Parse markdown into HTML
  const renderer = new marked.Renderer();
  renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
    const cleanId = text
      .toLowerCase()
      .replace(/<[^>]*>/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    return `<h${depth} id="${cleanId}">${text}</h${depth}>`;
  };

  const renderedHtml = await marked.parse(doc.content, { renderer, gfm: true, breaks: true });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
      <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
        {/* Main Article Content */}
        <article className="flex-1 min-w-0">
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

        {/* Right Sidebar: Table of Contents */}
        <aside className="hidden xl:block w-60 shrink-0 sticky top-20 self-start">
          <DocsTableOfContents headings={doc.headings} />
        </aside>
      </div>
    </div>
  );
}
