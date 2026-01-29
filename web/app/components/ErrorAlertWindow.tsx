import React, {useState} from "react";
import ReactMarkdown from "react-markdown";
import {ExclamationCircleIcon, ChevronDownIcon, ChevronUpIcon} from "@heroicons/react/24/outline";

interface SubmissionErrorProps {
    errorAlertMessage: string;
    id: string;
}

export default function ErrorAlertWindow({errorAlertMessage, id}: SubmissionErrorProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const MAX_LENGTH = 300;
    const isLongMessage = errorAlertMessage.length > MAX_LENGTH;

    const displayMessage = isExpanded || !isLongMessage ? errorAlertMessage : errorAlertMessage.substring(0, MAX_LENGTH) + "...";

    return (
        <>
            <dialog
                id={id}
                className="modal modal-bottom sm:modal-middle">
                <div className="modal-box w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 hover:bg-error/10">✕
                        </button>
                    </form>

                    <div className="flex flex-col items-start gap-4">
                        <div className="flex flex-row gap-4">
                            <ExclamationCircleIcon className="w-8 h-8 text-error"/>
                            <h3 className="font-bold text-xl text-error mb-2">Something went wrong</h3>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="text-base-content/90 font-medium">
                                <ReactMarkdown>{displayMessage}</ReactMarkdown>
                            </div>

                            {isLongMessage && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="btn btn-ghost btn-sm mt-2 gap-1 text-error hover:bg-error/10">
                                    {isExpanded ? (
                                        <>
                                            Show less
                                            <ChevronUpIcon className="w-4 h-4"/>
                                        </>
                                    ) : (
                                        <>
                                            Show more
                                            <ChevronDownIcon className="w-4 h-4"/>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-error/5 rounded-xl shadow-2xl p-2 mt-4 border border-error/20">
                        <p className="text-xs text-base-content/70">
                            If the problem persists, please contact us at{" "}
                            <a
                                className="link link-primary font-medium"
                                href="mailto:k8s@ics.muni.cz">
                                k8s@ics.muni.cz
                            </a>
                        </p>
                    </div>
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
