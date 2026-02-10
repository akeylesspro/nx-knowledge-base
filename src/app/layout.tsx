import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalConfig, TranslationWarper } from "@/components/client/config";
import Script from "next/script";

export const metadata: Metadata = {
    title: "nx-kb",
    description: "code knowledge base for akeyless systems",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <Script async src="https://kit.fontawesome.com/41b303a8d1.js" crossOrigin="anonymous" />
            </head>
            <body className={`w-dvw h-dvh`} suppressHydrationWarning>
                <GlobalConfig />
                <TranslationWarper>{children}</TranslationWarper>
            </body>
        </html>
    );
}
