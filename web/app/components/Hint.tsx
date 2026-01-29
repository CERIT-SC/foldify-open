import ReactMarkdown from "react-markdown";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface HintProps {
    hint: string;
}

// Preprocess the hint string to replace \n with Markdown-friendly line breaks
const preprocessHint = (hint: string) => {
    if (hint.includes("~newline")) {
        return hint.split("~newline");
    }
    return [hint];
};

export const Hint = ({ hint }: HintProps) => {
    const processedHint = preprocessHint(hint);
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Update position when dropdown opens
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const dropdownWidth = 384; // 96 * 4 = 384px (w-96)

            // Calculate position
            let left = rect.right + window.scrollX - dropdownWidth;
            const top = rect.bottom + window.scrollY + 4;

            // Adjust if dropdown would overflow on the left
            if (left < window.scrollX) {
                left = rect.left + window.scrollX;
            }

            // Adjust if dropdown would overflow on the right
            if (left + dropdownWidth > window.scrollX + window.innerWidth) {
                left = window.scrollX + window.innerWidth - dropdownWidth - 8;
            }

            setPosition({ top, left });
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <>
            <div
                ref={buttonRef}
                tabIndex={0}
                role="button"
                className="btn btn-circle btn-ghost btn-xs"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="h-5 w-5 stroke-current">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            {isOpen &&
                typeof document !== "undefined" &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        className="card compact rounded-box z-[9999] min-w-96 max-w-3xl shadow-lg bg-base-100"
                        style={{
                            position: "absolute",
                            top: position.top,
                            left: position.left,
                        }}>
                        <div className="card-body text-wrap">
                            {processedHint.map((line, index) => (
                                <ReactMarkdown key={index}>{line}</ReactMarkdown>
                            ))}
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
};
