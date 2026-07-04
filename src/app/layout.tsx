import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Script from "next/script";

export const metadata: Metadata = {
  title: "AnyDM | AI Social Commerce Operating System",
  description:
    "Scale your Instagram sales automation with clinical precision and real-time AI analytics. Re-imagined for modern digital stores.",
  icons: {
    icon: "/icons/fav_icon.ico",
    shortcut: "/icons/fav_icon.ico",
    apple: "/icons/fav_icon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Mono&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background antialiased selection:bg-primary/20 min-h-screen flex flex-col">
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-[#605ca2]/5 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[10%] right-[0%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full"></div>
        </div>

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}