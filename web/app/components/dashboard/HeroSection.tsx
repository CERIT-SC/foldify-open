"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRightIcon, BoltIcon, EyeIcon, Squares2X2Icon, CogIcon, AcademicCapIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

const CITATION =
    "Ďuráčiová, R.; Capandová, M.; Berka, K.; Svobodová, R.; Slanináková, T.; Kováč, K.; Antol, M.; Hejtmánek, L. " +
    "Foldify: Web Application for Protein Structure Prediction. J. Chem. Inf. Model. 2026. https://doi.org/10.1021/acs.jcim.6c01154";

const PAPER_URL = "https://doi.org/10.1021/acs.jcim.6c01154";

const TAB_COUNT = 2;
const TAB_ROTATION_MS = 6000;
// Duration of one half of the cross-fade; must match the Tailwind `duration-*` class below.
const TAB_FADE_MS = 700;

export default function HeroSection() {
    const [activeTab, setActiveTab] = useState(0);
    const [displayedTab, setDisplayedTab] = useState(0);
    const [visible, setVisible] = useState(true);
    const [autoRotate, setAutoRotate] = useState(true);

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
        setVisible(false);
        const timeout = setTimeout(() => {
            setDisplayedTab(activeTab);
            setVisible(true);
        }, TAB_FADE_MS);
        return () => clearTimeout(timeout);
    }, [activeTab, displayedTab]);

    const selectTab = (index: number) => {
        setActiveTab(index);
        setAutoRotate(false);
    };
    return (
        <div
            className="hero bg-linear-to-br from-secondary/20 to-primary/10 py-16 lg:py-20 relative overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/hero-bg-3.svg')" }}>
            {/* Background decoration */}
            <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
            <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />

            <div className="hero-content w-full max-w-7xl mx-auto px-6">
                <div className="flex-1 flex flex-col items-left text-left space-y-4">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight">
                        Protein Folding
                        <br />
                        <span className="text-base-content"> Platform</span>
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
                            className={`pl-1 pt-6 text-left min-h-32 transition-opacity duration-700 ease-in-out ${visible ? "opacity-100" : "opacity-0"}`}>
                            {displayedTab === 0 ?
                                <>
                                    <p className="text-sm text-base-content/70 mb-8">
                                        Run <b>AlphaFold 2, AlphaFold 3, ColabFold, ESMFold, and OmegaFold</b>. Submit anytime, compare results side
                                        by side, pick your best model.
                                    </p>
                                    <div className="flex flex-wrap justify-start gap-6 text-sm text-base-content/70 mb-4">
                                        <div className="flex items-center">
                                            <EyeIcon className="w-4 h-4 mr-2 text-primary" />
                                            3D Result Comparison
                                        </div>
                                        <div className="flex items-center">
                                            <Squares2X2Icon className="w-4 h-4 mr-2 text-primary" />
                                            Multiple Tools
                                        </div>
                                        <div className="flex items-center">
                                            <BoltIcon className="w-4 h-4 mr-2 text-primary" />
                                            Powerful Hardware
                                        </div>
                                    </div>
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
