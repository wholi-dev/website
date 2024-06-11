import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wholi",
  description: "An online farmers market",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Beth+Ellen&display=swap" rel="stylesheet"></link>
      </head>
      <body className="font-body">{children}</body>
    </html>
  );
}