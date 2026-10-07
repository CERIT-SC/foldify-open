"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

const PAPER_URL = "https://doi.org/10.1021/acs.jcim.6c01154";
const GITHUB_URL = "https://github.com/CERIT-SC/foldify-open";

const TAB_COUNT = 2;
const TAB_ROTATION_MS = 6000;
// Duration of one half of the cross-fade; must match the Tailwind `duration-*` class below.
const TAB_FADE_MS = 700;

export default function HeroSection() {
    const [activeTab, setActiveTab] = useState(0);
    const [displayedTab, setDisplayedTab] = useState(0);
    const [autoRotate, setAutoRotate] = useState(true);
    // The panel is hidden while it still shows the previous tab, i.e. during the fade-out.
    const visible = activeTab === displayedTab;

    useEffect(() => {
        if (!autoRotate) return;
        const interval = setInterval(() => {
            setActiveTab((prev) => (prev + 1) % TAB_COUNT);
        }, TAB_ROTATION_MS);
        return () => clearInterval(interval);
    }, [autoRotate]);

    // Cross-fade: fade the current panel out, swap its content, then fade back in.
    useEffect(() => {
        if (activeTab === displayedTab) return;
        const timeout = setTimeout(() => {
            setDisplayedTab(activeTab);
        }, TAB_FADE_MS);
        return () => clearTimeout(timeout);
    }, [activeTab, displayedTab]);

    const selectTab = (index: number) => {
        setActiveTab(index);
        setAutoRotate(false);
    };
    return (
        <div
            className="hero bg-linear-to-br from-secondary/20 to-primary/10 py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/hero-bg-3.svg')" }}>
            {/* Background decoration */}
            <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
            <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />

            <div className="hero-content w-full max-w-7xl mx-auto px-0">
                <div className="flex-1 flex flex-col items-left text-left space-y-4">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight">
                        Foldify
                        <br />
                        <span className="text-base-content"> Platform Showcase</span>
                    </h1>

                    <div className="max-w-xl w-full">
                        <div
                            role="tablist"
                            className="tabs tabs-border">
                            <button
                                role="tab"
                                className={`tab ${activeTab === 0 ? "tab-active" : ""}`}
                                aria-selected={activeTab === 0}
                                onClick={() => selectTab(0)}>
                                About
                            </button>
                            <button
                                role="tab"
                                className={`tab ${activeTab === 1 ? "tab-active" : ""}`}
                                aria-selected={activeTab === 1}
                                onClick={() => selectTab(1)}>
                                Cite
                            </button>
                        </div>

                        <div
                            className={`pl-1 pt-6 text-left min-h-40 transition-opacity duration-700 ease-in-out ${visible ? "opacity-100" : "opacity-0"}`}>
                            {displayedTab === 0 ?
                                <>
                                    <p className="text-sm text-base-content/70 mb-8">
                                        Showcase of the web application for protein structure prediction. Explore curated case studies - visualize 3D
                                        structures and compare results from multiple tools. Contact the developers via support if you have questions
                                        or feedback.
                                    </p>
                                    <a
                                        href={GITHUB_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-sm text-base-content/70 hover:text-primary transition-colors mb-4">
                                        <svg
                                            className="w-4 h-4 mr-2 text-primary"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            aria-hidden="true">
                                            <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
                                        </svg>
                                        Deploy on your own hardware
                                    </a>
                                </>
                            :   <>
                                    <p className="text-sm text-base-content/70 mb-3">
                                        If you use results generated with Foldify in your research, please cite:
                                    </p>
                                    <blockquote className="border-l-2 border-primary/40 pl-4 text-sm leading-relaxed text-base-content/90">
                                        Ďuráčiová, R.; Capandová, M.; Berka, K.; Svobodová, R.; Slanináková, T.; Kováč, K.; Antol, M.; Hejtmánek, L.
                                        Foldify: Web Application for Protein Structure Prediction.{" "}
                                        <cite className="italic">J. Chem. Inf. Model.</cite> <span className="font-semibold">2026</span>.{" "}
                                        <a
                                            href={PAPER_URL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="link link-primary font-medium">
                                            doi.org/10.1021/acs.jcim.6c01154
                                        </a>
                                    </blockquote>
                                </>
                            }
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="#get-started"
                            className="btn btn-primary btn-md group transition-all text-white duration-300 hover:scale-105 hover:shadow-lg"
                            aria-label="Get started with protein analysis">
                            Get Started
                            <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="#examples"
                            className="btn btn-outline btn-md transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-white/60"
                            aria-label="View example protein analyses">
                            View Examples
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
