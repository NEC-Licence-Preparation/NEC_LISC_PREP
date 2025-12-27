import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import SupportChatBubble from "@/components/SupportChatBubble";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEC License Prep",
  description: "Practice and track NEC exam readiness",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
      >
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-K1KX6N1S1X"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-K1KX6N1S1X');
          `}
        </Script>

        {/* Remove unexpected attributes introduced by browser extensions before React hydrates */}
        <Script id="sanitize-body-attrs" strategy="beforeInteractive">
          {`
            try {
              var body = document.body;
              var attrs = Array.from(body.attributes);
              attrs.forEach(function (attr) {
                var name = attr.name || "";
                if (/^__processed_/i.test(name) || /^bis_register$/i.test(name)) {
                  body.removeAttribute(name);
                }
              });
            } catch (e) {
              // noop
            }
          `}
        </Script>
        <Providers>
          {/* Site-wide disclaimer banner */}
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900">
            <div className="mx-auto max-w-6xl px-4 py-2 text-sm">
              <span className="font-medium">Website under development:</span>
              <span className="ml-2">
                Around 15K questions are being added. Accounts might be deleted during updates;
                feel free to create a new account. Use the Tickets feature to create a ticket and
                contact admin.
              </span>
              <a
                href="/my-tickets"
                className="ml-3 underline decoration-amber-600 hover:text-amber-700"
              >
                Go to Tickets
              </a>
            </div>
          </div>
          {children}
          <SupportChatBubble />
        </Providers>
      </body>
    </html>
  );
}
