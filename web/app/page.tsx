"use client";

import Link from "next/link";
import {ArrowDownRightIcon, ArrowRightIcon} from "@heroicons/react/24/outline";

export default function Login() {

    return (
        <main
            data-theme="light"
            className="flex flex-col min-h-screen">
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">

                <div className="w-full max-w-sm sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl">
                    <div className="backdrop-blur-md bg-white/30 border border-white/20 rounded-2xl shadow-xl">
                        <div className="p-6 sm:p-8 lg:p-12 text-center">
                            {/* Header Section */}
                            <div className="mb-6 sm:mb-8 lg:mb-10">
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary mb-2 sm:mb-4">Foldify</h1>
                                <p className="text-base sm:text-lg lg:text-xl text-base-content/70 mb-4 sm:mb-6 lg:mb-8 px-2 sm:px-0">
                                    Advanced Protein Structure Prediction Platform
                                </p>
                            </div>

                            {/* Description Section */}
                            <div className="max-w-xs sm:max-w-xl lg:max-w-3xl mx-auto mb-6 sm:mb-8 lg:mb-10">
                                <div
                                    className="text-sm sm:text-base lg:text-lg text-base-content/80 leading-relaxed space-y-3 sm:space-y-4">
                                    <p className="px-2 sm:px-0">
                                        User friendly application for complex protein structure predictions using
                                        artificial intelligence tools
                                        like <span
                                        className="font-semibold text-primary whitespace-nowrap">AlphaFold2</span>,{" "}
                                        <span
                                            className="font-semibold text-primary whitespace-nowrap">AlphaFold3</span>,{" "}
                                        <span
                                            className="font-semibold text-primary whitespace-nowrap">ColabFold</span>,{" "}
                                        <span className="font-semibold text-primary whitespace-nowrap">OmegaFold</span>,
                                        and{" "}
                                        <span className="font-semibold text-primary whitespace-nowrap">ESMFold</span>.
                                    </p>
                                    <p className="px-2 sm:px-0">
                                        Predicted structures can be viewed interactively in a web browser using the
                                        full-featured Mol* viewer. All
                                        results can be downloaded or accessed on brno12-cerit storage for further
                                        processing.
                                    </p>
                                </div>
                            </div>

                            <Link href="/dashboard"
                                  className="btn btn-primary shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-0.5">
                                Continue to Dashboard
                                <ArrowRightIcon className="w-5 h-5"/>
                            </Link>


                            {/* Additional Info for Mobile */}
                            <div className="block sm:hidden">
                                <div className="text-xs text-base-content/50 space-y-1">
                                    <p>Supports mobile viewing</p>
                                    <p>Desktop recommended for analysis</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
