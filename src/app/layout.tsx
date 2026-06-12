import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: "うさとらコンペ | U&T COMPETITION",
  description: "U&T Fitness member performance tracking and rankings"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
