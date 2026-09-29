import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { LayoutShell } from "@/components/layout/LayoutShell";

// Lato approximates Zoom's sans (plan D17). Loaded once here.
const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "zoom-clone",
  description: "Assignment project: Zoom-style meetings (no real audio/video).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${lato.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans bg-white">
        <ToastProvider>
          <LayoutShell />
          {/* pt-16: clear fixed TopNav height. md:pl-16: clear fixed IconRail width (w-16 = 64px) */}
          <div className="pt-16 md:pl-16 min-h-screen">{children}</div>
        </ToastProvider>
      </body>
    </html>
  );
}
