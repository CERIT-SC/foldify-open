"use client";

import Link from "next/link";
import Image from "next/image";
import foldifyLogo from "@/public/foldify-logo.png";
import {
    HomeIcon,
    DocumentTextIcon,
    Bars3Icon
} from "@heroicons/react/24/outline";


const Header = () => {

    const navigationItems = [
        {href: "/alphafold3/v1", label: "AlphaFold 3"},
        {href: "/alphafold", label: "AlphaFold 2"},
        {href: "/colabfold", label: "ColabFold"},
        {href: "/omegafold", label: "OmegaFold"},
        {href: "/esmfold", label: "ESMFold"},
    ];

    return (
        <header className="navbar shadow-md border-b bg-transparent px-4">
            {/* Logo Section */}
            <div className="navbar-start">
                <Link
                    href="/dashboard"
                    className="btn btn-ghost hover:bg-transparent p-2">
                    <Image
                        src={foldifyLogo}
                        width={160}
                        height={100}
                        alt="Foldify Logo"
                        className="object-contain "
                    />
                </Link>
            </div>

            {/* Navigation Menu - Desktop */}
            <div className="navbar-center hidden lg:flex">
                <div className="flex items-center gap-1">
                    {/* Home Icon */}
                    <Link
                        href="/dashboard"
                        className="btn btn-ghost btn-sm hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Dashboard">
                        <HomeIcon className="w-5 h-5"/>
                    </Link>

                    {/* Documentation */}
                    <Link
                        href="https://docs.cerit.io/en/docs/web-apps/foldify"
                        target="_blank"
                        className="btn btn-ghost btn-sm hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Documentation">
                        <DocumentTextIcon className="w-5 h-5"/>
                    </Link>

                    {/* Divider */}
                    <div className="divider divider-horizontal h-6"></div>

                    {/* Navigation Items */}
                    {navigationItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="btn btn-ghost font-medium hover:bg-primary/10 hover:text-primary transition-colors">
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* User Section */}
            <div className="navbar-end flex items-center gap-2">
                {/* Mobile Menu */}
                <div className="dropdown dropdown-end lg:hidden">
                    <div
                        tabIndex={0}
                        role="button"
                        className="btn btn-ghost btn-sm">
                        <Bars3Icon className="w-5 h-5"/>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu dropdown-content mt-3 z-[1] p-2 shadow-lg bg-white rounded-xl w-52 border border-base-200">
                        <li>
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2">
                                <HomeIcon className="w-4 h-4"/>
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <a
                                href="https://docs.cerit.io/en/docs/web-apps/foldify"
                                target="_blank"
                                className="flex items-center gap-2">
                                <DocumentTextIcon className="w-4 h-4"/>
                                Documentation
                            </a>
                        </li>
                        <div className="divider my-1"></div>
                        {navigationItems.map((item) => (
                            <li key={item.href}>
                                <Link href={item.href}>{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
        </header>
    );
};

export default Header;
