import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ProfileDraftProvider } from "./onboarding/profile-draft-context";
import { AuthProvider } from "./auth/auth-context";
import SiteNavigation from "./site-navigation";
import SplashScreen, { splashBootScript } from "./splash-screen";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "StaffConnect", template: "%s | StaffConnect" },
  description: "Find trusted household staff — nannies, cleaners, cooks, drivers and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the splash boot script sets data-splash on <html> before hydration.
    <html lang="en" data-scroll-behavior="smooth" className={`${geist.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: splashBootScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900 antialiased">
        <SplashScreen />
        <AuthProvider>
          <ProfileDraftProvider>
            <SiteNavigation />
            {children}
          </ProfileDraftProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
