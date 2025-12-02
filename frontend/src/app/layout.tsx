import type { Metadata } from "next";
import localFont from "next/font/local";
import { AuthProvider } from '@/context/AuthContext';
import "./globals.css";

const vazirmatn = localFont({
  src: [
    {
      path: './fonts/Vazirmatn-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Vazirmatn-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
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
