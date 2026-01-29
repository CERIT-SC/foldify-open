import React from "react";
import { ExclamationTriangleIcon, TrashIcon } from "@heroicons/react/24/outline";

type DeleteJobModalProps = {
    onConfirm: () => void;
    onClose: () => void;
    jobName: string;
};

export default function DeleteJobModal({ onConfirm, onClose, jobName }: DeleteJobModalProps) {
    return (
        <dialog
            id="delete_job_modal"
            className="modal modal-bottom sm:modal-middle">
            <div className="modal-box max-w-2xl">
                <form method="dialog">
                    <button
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 hover:bg-error/10"
                        onClick={onClose}>
                        ✕
                    </button>
                </form>

                <div className="flex flex-col items-start gap-4">
                    <div className="flex flex-row gap-4 items-center">
                        <div className="bg-error/10 p-3 rounded-full">
                            <ExclamationTriangleIcon className="w-8 h-8 text-error" />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-error">Delete Job</h3>
                            <p className="text-sm text-base-content/70 mt-1">This action cannot be undone</p>
                        </div>
                    </div>

                    <p className="text-base-content/90 mb-4 w-full">
                        Are you sure you want to permanently delete the job <span className="font-bold text-error">&quot;{jobName}&quot;</span> and
                        all its files?
                    </p>

                    <div className="bg-base-200/50 rounded-3xl p-4 border border-base-300 w-full">
                        <div className="flex items-start gap-2">
                            <ExclamationTriangleIcon className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-base-content/80">
                                <p className="font-semibold mb-1">The following will be deleted:</p>
                                <ul className="list-disc list-inside space-y-1 ml-2">
                                    <li>All prediction results</li>
                                    <li>All input files</li>
                                    <li>Job metadata and logs</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-action mt-6">
                    <button
                        className="btn btn-ghost hover:bg-base-200"
                        onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-error gap-2"
                        onClick={onConfirm}>
                        <TrashIcon className="w-5 h-5" />
                        Delete Job
                    </button>
                </div>
            </div>

            <form
                method="dialog"
                className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    );
}
