import React from "react";
import Image from "next/image";
import einfraLogo from "@/public/e-infra_logo_lilek.png";

export default function Footer() {
    return (
        <div className="footer-container pt-10 pb-10 mt-4 rounded-lg">
            <footer className="footer sm:footer-horizontal text-base-content px-20 ">
                <aside>
                    <Image
                        src={einfraLogo}
                        width={150}
                        alt="e-infra"
                        className="-ml-6 -mt-6"
                    />
                    <p className="text-sm text-center mt-2 font-bold">Operated by CERIT-SC, ICS MUNI</p>
                    <p className="text-sm text-center">Developed by Romana Ďuračiová</p>
                    <p className="text-sm text-center">Copyright © {new Date().getFullYear()} - All rights reserved</p>
                </aside>
                <nav>
                    <h6 className="footer-title">Resources</h6>
                    <a
                        href="https://docs.cerit.io/en/docs/web-apps/foldify"
                        className="link link-hover "
                        target="_blank">
                        Documentation
                    </a>
                    <a
                        href="https://www.metacentrum.cz/en/about/rules/index.html"
                        className="link link-hover "
                        target="_blank">
                        Terms of use
                    </a>
                    <a
                        className="link link-primary underline flex flex-row gap-2"
                        href="mailto:k8s@ics.muni.cz">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={20}
                            height={20}
                            viewBox="0 0 24 24">
                            <g fill="currentColor">
                                <path
                                    d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z"/>
                                <path
                                    d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z"/>
                            </g>
                        </svg>
                        k8s@ics.muni.cz
                    </a>
                </nav>
                <nav>
                    <h6 className="footer-title">Tools</h6>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                            <a
                                href="/alphafold3/v1"
                                className="link link-hover">
                                AlphaFold 3
                            </a>
                            <a
                                href="/alphafold"
                                className="link link-hover">
                                AlphaFold 2
                            </a>
                            <a
                                href="/colabfold"
                                className="link link-hover">
                                ColabFold
                            </a>
                        </div>
                        <div className="flex flex-col gap-2">
                            <a
                                href="/omegafold"
                                className="link link-hover">
                                OmegaFold
                            </a>
                            <a
                                href="/esmfold"
                                className="link link-hover">
                                ESMFold
                            </a>
                        </div>
                    </div>
                </nav>
            </footer>
        </div>
    );
}
