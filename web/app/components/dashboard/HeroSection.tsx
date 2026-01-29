import Link from "next/link";
import { ArrowRightIcon, BoltIcon, EyeIcon, Squares2X2Icon, CogIcon } from "@heroicons/react/24/outline";

export default function HeroSection() {
    return (
        <div className="hero bg-linear-to-br from-secondary/20 to-primary/10 py-20 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
            <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />

            <div className="hero-content text-center max-w-6xl mx-auto px-4 ">
                <div className="flex flex-col items-center space-y-8">
                    {/* Main heading */}
                    <div className="space-y-4">
                        <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
                            <CogIcon className="w-4 h-4 mr-2 animate-spin-slow" />
                            Powered by Advanced AI
                        </div>
                        <h1 className="text-6xl md:text-7xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight">
                            Protein Folding
                            <br />
                            <span className="text-base-content"> Platform</span>
                        </h1>
                    </div>

                    {/* Feature highlights */}
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-base-content/70 mb-4">
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

                    {/* CTA buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Link
                            href="#get-started"
                            className="btn btn-primary btn-lg group transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            aria-label="Get started with protein analysis">
                            Get Started
                            <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="#examples"
                            className="btn btn-outline btn-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-white/60"
                            aria-label="View example protein analyses">
                            View Examples
                        </Link>
                    </div>

                    {/* Stats or trust indicators */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 text-center">
                        <div className="space-y-2">
                            <div className="text-3xl font-bold text-primary">2000+</div>
                            <div className="text-sm text-base-content/70">Predicted Proteins</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-3xl font-bold text-primary">5</div>
                            <div className="text-sm text-base-content/70">Prediction Tools</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-3xl font-bold text-primary">24/7</div>
                            <div className="text-sm text-base-content/70">Processing</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
