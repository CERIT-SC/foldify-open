import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

interface SuccessAlertProps {
    id: string;
    successAlertMessage: string;
    additionalInfo: string;
}

export default function SuccessAlertWindow({ id, successAlertMessage, additionalInfo }: SuccessAlertProps) {
    const AUTO_CLOSE_TIME = 6;
    const [countdown, setCountdown] = useState(AUTO_CLOSE_TIME);

    useEffect(() => {
        const dialog = document.getElementById(id) as HTMLDialogElement;
        if (!dialog) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes" && mutation.attributeName === "open" && dialog.open) {
                    setCountdown(AUTO_CLOSE_TIME);

                    const interval = setInterval(() => {
                        setCountdown((prev) => {
                            if (prev <= 1) {
                                clearInterval(interval);
                                dialog.close();
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 1000);

                    return () => clearInterval(interval);
                }
            });
        });

        observer.observe(dialog, { attributes: true });

        return () => observer.disconnect();
    }, [id]);

    return (
        <>
            <dialog
                id={id}
                className="modal modal-bottom sm:modal-middle">
                <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 hover:bg-success/10">✕</button>
                    </form>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs text-base-content/60">Auto-closing in {countdown}s</span>
                    </div>

                    <div className="flex flex-col items-start gap-2">
                        <div className="flex flex-row gap-4">
                            <CheckCircleIcon className="w-8 h-8 text-success" />
                            <h3 className="font-bold text-xl text-success mb-2">Success!</h3>
                        </div>

                        <div className="flex-1 min-w-0 text-base-content/90 font-medium">
                            <ReactMarkdown>{successAlertMessage}</ReactMarkdown>
                        </div>
                    </div>

                    {additionalInfo && (
                        <div className="bg-success/5 rounded-xl shadow-2xl p-2 mt-4 border border-success/20">
                            <p className="text-xs text-base-content/70 break-words">{additionalInfo}</p>
                        </div>
                    )}
                </div>
                <form
                    method="dialog"
                    className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </>
    );
}
