import Link from "next/link";

export const BackHomeButton = () => {
    return (
        <nav className="mb-8">
            <Link
                className="inline-flex items-center gap-2 text-primary hover:text-primary-focus font-medium transition-colors"
                href="/dashboard">
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
                Back to Dashboard
            </Link>
        </nav>
    );
};
