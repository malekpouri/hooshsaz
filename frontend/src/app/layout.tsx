import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { AuthProvider } from '@/context/AuthContext';
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  title: "هوش‌ساز - چت هوشمند",
  description: "پلتفرم گفتگوی هوشمند چند کاربره",
};

import { ThemeProvider } from '@/context/ThemeContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={vazirmatn.className}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
