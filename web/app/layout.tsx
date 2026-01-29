import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import React from "react";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
    title: "FOLDIFY",
    description: "Browser-based 3D model folding tool using AlphaFold 3, AlphaFold 2, ColabFold and more.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className="scroll-smooth">
            <body className={`${poppins.className} min-h-screen`}>
                <header>
                    <Header />
                </header>
                {children}
                <footer>
                    <Footer />
                </footer>
            </body>
        </html>
    );
}
