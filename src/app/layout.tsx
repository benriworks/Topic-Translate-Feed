import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Topic Translate Feed",
  description: "日本語のXポストを英語翻訳付きで表示するアプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
