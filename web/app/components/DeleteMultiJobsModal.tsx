import React from "react";
import { ExclamationTriangleIcon, TrashIcon } from "@heroicons/react/24/outline";

type DeleteJobModalProps = {
    onConfirm: () => void;
    onClose: () => void;
    selectedJobs: string[];
    deleting: boolean;
    runningJobsError?: boolean;
};

export default function DeleteMultiJobsModal({ onConfirm, onClose, selectedJobs, deleting, runningJobsError }: DeleteJobModalProps) {
    const jobCount = selectedJobs.length;

    return (
        <>
            <dialog
                id="delete_multi_jobs_modal"
                className="modal modal-bottom sm:modal-middle">
                <div className="modal-box max-w-2xl">
                    <form method="dialog">
                        <button
                            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 hover:bg-error/10"
                            onClick={onClose}
                            disabled={deleting}>
                            ✕
                        </button>
                    </form>

                    {runningJobsError ? (
                        <div className="flex flex-row text-error gap-2 items-center">
                            <ExclamationTriangleIcon className="w-10 h-10" />
                            <span className="font-bold">Some of the selected jobs are still running and cannot be deleted.</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-start gap-4">
                            <div className="flex flex-row gap-4 items-center">
                                <div className="bg-error/10 p-3 rounded-full">
                                    <ExclamationTriangleIcon className="w-8 h-8 text-error" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-error">
                                        Delete {jobCount} {jobCount === 1 ? "Job" : "Jobs"}
                                    </h3>
                                    <p className="text-sm text-base-content/70 mt-1">This action cannot be undone</p>
                                </div>
                            </div>

                            {deleting ? (
                                <div className="w-full py-8">
                                    <div className="flex flex-col items-center gap-4">
                                        <span className="loading loading-spinner loading-lg text-error"></span>
                                        <div className="text-center">
                                            <p className="font-semibold text-base-content">Deleting jobs...</p>
                                            <p className="text-sm text-base-content/70 mt-1">
                                                Please wait while we delete {jobCount} {jobCount === 1 ? "job" : "jobs"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full">
                                    <p className="text-base-content/90 mb-4">
                                        Are you sure you want to permanently delete{" "}
                                        <span className="font-bold text-error">
                                            {jobCount} {jobCount === 1 ? "job" : "jobs"}
                                        </span>{" "}
                                        and all their files?
                                    </p>

                                    <div className="bg-base-200/50 rounded-lg p-4 max-h-60 overflow-y-auto border border-base-300 mb-4">
                                        <p className="text-sm font-semibold mb-3 text-base-content/70 sticky top-0 bg-base-200/50 pb-2">
                                            Jobs to be deleted ({jobCount}):
                                        </p>
                                        <ul className="space-y-2">
                                            {selectedJobs.map((job, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-base-300/30 transition-colors">
                                                    <TrashIcon className="w-4 h-4 text-error flex-shrink-0" />
                                                    <span className="font-medium truncate">{job}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="modal-action mt-6">
                        <button
                            className="btn btn-ghost hover:bg-base-200"
                            onClick={onClose}
                            disabled={deleting}>
                            Cancel
                        </button>
                        <button
                            className="btn btn-error gap-2"
                            onClick={onConfirm}
                            disabled={deleting}
                            hidden={runningJobsError}>
                            {deleting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <TrashIcon className="w-5 h-5" />
                                    Delete {jobCount} {jobCount === 1 ? "Job" : "Jobs"}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <form
                    method="dialog"
                    className="modal-backdrop">
                    <button
                        onClick={onClose}
                        disabled={deleting}>
                        close
                    </button>
                </form>
            </dialog>
        </>
    );
}
