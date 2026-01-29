import Loading from "@/app/components/Loading";
import { useState } from "react";
import Link from "next/link";
import {
    ArrowPathIcon,
    MagnifyingGlassIcon,
    EyeIcon,
    LockClosedIcon,
    ArrowDownTrayIcon,
    TrashIcon,
    EllipsisHorizontalIcon,
    XMarkIcon,
    FolderOpenIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";

interface ComputedJobsTableProps {
    loading: boolean;
    loadJobTable: () => void;
    jobs: any[];
    downloadJob: (jobName: string) => void;
    openDeleteJobModal: (jobName: string) => void;
    openMultiDeleteModal: (selectedJobs: string[], runningJobsError: boolean) => void;
    listPublicJobs: boolean;
    setListPublicJobs: (value: boolean) => void;
    switchPublicity: (jobName: string) => void;
}

export default function ComputedJobsTable({
    loading,
    loadJobTable,
    jobs,
    downloadJob,
    openDeleteJobModal,
    openMultiDeleteModal,
    listPublicJobs,
    setListPublicJobs,
    switchPublicity,
}: ComputedJobsTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

    const handleSearch = () => {
        if (searchQuery === "") return jobs;
        return jobs.filter((job) => job[1].toLowerCase().includes(searchQuery.toLowerCase()));
    };

    // Selection handlers
    const toggleJobSelection = (jobName: string) => {
        setSelectedJobs((prev) => (prev.includes(jobName) ? prev.filter((name) => name !== jobName) : [...prev, jobName]));
    };

    const toggleSelectAll = () => {
        const filteredJobNames = filteredJobs.map((job) => job[1]);
        if (selectedJobs.length === filteredJobNames.length) {
            setSelectedJobs([]);
        } else {
            setSelectedJobs(filteredJobNames);
        }
    };

    const isJobSelected = (jobName: string) => selectedJobs.includes(jobName);

    const handleMultiDelete = () => {
        console.log("Deleting jobs:", selectedJobs);
        let runningJobsError = false;
        if (
            selectedJobs.some((jobName) => {
                const job = jobs.find((j) => j[1] === jobName);
                return job && (job[5] === "Active" || job[5] === "Running" || job[5] === "Waiting..." || job[5] === "Queued");
            })
        ) {
            runningJobsError = true;
        }

        openMultiDeleteModal(selectedJobs, runningJobsError);

        setSelectedJobs([]);
    };

    const getStatusBadge = (status: string) => {
        const statusMap = {
            Success: "badge-success",
            Succeeded: "badge-success",
            Failed: "badge-error",
            Active: "badge-dash badge-primary animate-bounce",
            "Waiting...": "badge-ghost badge-secondary animate-bounce",
            Running: "badge-dash badge-primary animate-bounce",
            Queued: "badge-dash badge-secondary animate-bounce",
        };

        const tooltipMap = {
            Success: "Your predictions are ready.",
            Succeeded: "Your predictions are ready.",
            Failed: "Computation failed.",
            Active: "Computing your predictions.",
            "Waiting...": "Waiting for resources.",
            Running: "Computing your predictions.",
            Queued: "Waiting for resources.",
        };

        const badgeClass = statusMap[status as keyof typeof statusMap] || "badge-primary";
        const tooltip = tooltipMap[status as keyof typeof tooltipMap] || status;

        return (
            <div
                className="tooltip"
                data-tip={tooltip}>
                <div className={`badge badge-outline ${badgeClass}`}>{status}</div>
            </div>
        );
    };

    const ActionButtons = ({ job }: { job: any }) => {
        const isJobRunning = job[5] === "Active" || job[5] === "Running" || job[5] === "Waiting..." || job[5] === "Queued";

        return (
            <>
                <div className="hidden lg:flex flex-wrap gap-2 justify-center">
                    <Link
                        href={`/result/${job[1]}`}
                        className={`${
                            isJobRunning ?
                                "btn btn-ghost btn-sm underline text-sm transition ease-in-out hover:bg-white/80 hover:scale-105"
                            :   "btn btn-primary btn-sm transition ease-in-out hover:scale-105 "
                        }`}>
                        <EyeIcon className="w-4 h-4" />
                        {isJobRunning ? "View Details" : "View Results"}
                    </Link>

                    <button
                        onClick={() => downloadJob(job[1])}
                        hidden={isJobRunning}
                        className="btn btn-outline btn-sm transition ease-in-out hover:scale-105 hover:bg-white/80">
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Download
                    </button>

                    {!listPublicJobs && (
                        <button
                            onClick={() => openDeleteJobModal(job[1])}
                            className="btn btn-ghost btn-sm text-error transition ease-in-out hover:scale-105"
                            hidden={isJobRunning}>
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="lg:hidden dropdown dropdown-end">
                    <div
                        tabIndex={0}
                        role="button"
                        className="btn btn-ghost btn-sm">
                        <EllipsisHorizontalIcon className="w-5 h-5" />
                    </div>
                    <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg border">
                        <li>
                            <Link
                                href={`/result/${job[1]}`}
                                className="flex items-center gap-2 text-primary">
                                <EyeIcon className="w-4 h-4" />
                                View Results
                            </Link>
                        </li>
                        <li>
                            <button
                                onClick={() => downloadJob(job[1])}
                                className="flex items-center gap-2">
                                <ArrowDownTrayIcon className="w-4 h-4" />
                                Download
                            </button>
                        </li>
                        {!listPublicJobs && (
                            <li>
                                <button
                                    onClick={() => openDeleteJobModal(job[1])}
                                    className="flex items-center gap-2 text-error"
                                    hidden={isJobRunning}>
                                    <TrashIcon className="w-4 h-4" />
                                    Delete Job
                                </button>
                            </li>
                        )}
                    </ul>
                </div>
            </>
        );
    };

    const filteredJobs = handleSearch();
    const allFilteredSelected = filteredJobs.length > 0 && selectedJobs.length === filteredJobs.length;

    return (
        <div className="container mx-auto px-4 py-8 ">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-einfra-purple">Running & Completed Computations</h1>
                    <div className="badge badge-primary badge-outline">{filteredJobs.length}</div>
                </div>
            </div>

            <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 shadow-xl mb-6 border border-primary/20">
                {/* Multi-Compare Section */}
                <div className="card-body p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex-1">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                <EyeIcon className="w-5 h-5" />
                                Compare Multiple Results {selectedJobs.length > 1 && <div className="badge badge-primary">{selectedJobs.length}</div>}
                            </h3>

                            <p className="text-sm opacity-80">
                                {selectedJobs.length < 2 ?
                                    "Select multiple completed jobs to compare their results in a single view. The first selected job will be used as reference."
                                : selectedJobs.length <= 5 ?
                                    <span>
                                        Reference structure: <span className="font-semibold text-primary">{selectedJobs[0]}</span>
                                    </span>
                                :   "You can compare up to 5 jobs at a time. Please reduce your selection."}
                            </p>
                        </div>

                        <div className="flex flex-row gap-2">
                            {selectedJobs.length > 1 ?
                                <Link
                                    href={`/result/multi/${selectedJobs.join("_")}`}
                                    className={`btn btn-primary gap-2 transform transition ease-in-out hover:scale-105 ${
                                        selectedJobs.length > 5 ? "btn-disabled" : ""
                                    }`}
                                    target="blank">
                                    <EyeIcon className="w-4 h-4" />
                                    Compare Results
                                </Link>
                            :   <div className="btn btn-disabled gap-2">
                                    <EyeIcon className="w-4 h-4" />
                                    Select jobs to compare
                                </div>
                            }

                            {selectedJobs.length > 0 && (
                                <>
                                    {!listPublicJobs && (
                                        <button
                                            className="btn btn-outline btn-error gap-2 transition ease-in-out hover:scale-105"
                                            onClick={handleMultiDelete}>
                                            <TrashIcon className="w-4 h-4" />
                                            Delete Selected
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-ghost hover:bg-white/40 transition ease-in-out hover:scale-105"
                                        onClick={() => setSelectedJobs([])}>
                                        <XMarkIcon className="w-4 h-4" />
                                        Clear Selection
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Controls Section */}
                <div className="card  ">
                    <div className="card-body p-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            {/* Search */}
                            <div className="form-control w-full max-w-sm">
                                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                    <MagnifyingGlassIcon className="w-5 h-5" />
                                    Search Jobs
                                </h3>
                                <div className="input-group flex flex-row gap-2">
                                    <input
                                        type="text"
                                        className="input input-bordered w-full focus:input-primary"
                                        placeholder="Type job name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <span className="btn btn-square btn-primary">
                                        <MagnifyingGlassIcon className="h-4 w-4" />
                                    </span>
                                </div>
                            </div>

                            {/* Table view switch */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium ml-2 mb-2">View</span>
                                </label>
                                <div className="tabs tabs-boxed rounded-full shadow-xl border ">
                                    <button
                                        className={`tab rounded-full ${
                                            !listPublicJobs ? "tab-active bg-einfra-purple text-white hover:text-white" : ""
                                        }`}
                                        onClick={() => setListPublicJobs(false)}>
                                        My Jobs
                                    </button>
                                    <button
                                        className={`tab rounded-full ${
                                            listPublicJobs ? "tab-active bg-einfra-purple text-white hover:text-white" : ""
                                        }`}
                                        onClick={() => setListPublicJobs(true)}>
                                        Public Jobs
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {loading ?
                <div className="flex justify-center items-center min-h-96">
                    <Loading />
                </div>
            :   <>
                    {filteredJobs.length > 0 && (
                        <div className="flex justify-between items-center text-sm opacity-70 px-4 mb-4">
                            <span>
                                Showing {filteredJobs.length} of {jobs.length} jobs
                            </span>
                            <span>
                                Last updated: {new Date().toLocaleTimeString()}
                                <button
                                    className="btn btn-circle btn-sm btn-outline btn-primary hover:rotate-180 transition-transform duration-300 ml-4"
                                    onClick={loadJobTable}
                                    disabled={loading}>
                                    <ArrowPathIcon className="w-5 h-5" />
                                </button>
                            </span>
                        </div>
                    )}
                    <div className="space-y-6 max-h-[40rem] overflow-y-auto pb-10 rounded-3xl border shadow-xl">
                        {/* Table Section */}
                        <div className="card bg-white/20 rounded-3xl">
                            <div className="card-body p-0">
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead className="rounded-3xl">
                                            <tr>
                                                <th className="w-12">
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox checkbox-primary checkbox-sm"
                                                            checked={allFilteredSelected}
                                                            onChange={toggleSelectAll}
                                                        />
                                                    </label>
                                                </th>
                                                <th className="font-bold">
                                                    <div className="flex items-center gap-2">
                                                        <EyeIcon className="w-4 h-4" />
                                                        Visibility
                                                    </div>
                                                </th>
                                                <th className="font-bold">Job Name</th>
                                                <th className="font-bold hidden sm:table-cell">Service</th>
                                                <th className="font-bold hidden md:table-cell">Started</th>
                                                <th className="font-bold">Status</th>
                                                <th className="font-bold text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {!jobs || jobs.length === 0 ?
                                                <tr>
                                                    <td
                                                        colSpan={7}
                                                        className="text-center py-12">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <FolderOpenIcon className="w-20 h-20 text-base-content/50" />
                                                            <p className="text-base-content/70">
                                                                No jobs computed yet. Start a new computation or browse existing public jobs.
                                                            </p>
                                                            <div className="flex flex-row gap-2">
                                                                <Link
                                                                    href="dashboard#get-started"
                                                                    className="btn btn-primary btn-sm transition ease-in-out hover:scale-105">
                                                                    <PlusIcon className="w-4 h-4" />
                                                                    New Computation
                                                                </Link>
                                                                <button
                                                                    className="btn btn-outline btn-sm hover:bg-white/80 transition ease-in-out hover:scale-105"
                                                                    onClick={() => setListPublicJobs(true)}>
                                                                    <EyeIcon className="w-4 h-4" />
                                                                    Browse Public Jobs
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            : filteredJobs.length === 0 ?
                                                <tr>
                                                    <td
                                                        colSpan={7}
                                                        className="text-center py-12">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <MagnifyingGlassIcon className="w-8 h-8 text-base-content/50" />
                                                            <p className="text-base-content/70">No jobs match your search</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            :   filteredJobs.map((job, index) => (
                                                    <tr
                                                        key={index}
                                                        className={`hover:bg-primary/10 transition-colors ${
                                                            isJobSelected(job[1]) ? "bg-primary/5" : ""
                                                        }`}>
                                                        <th>
                                                            <label>
                                                                <input
                                                                    type="checkbox"
                                                                    className="checkbox checkbox-primary checkbox-sm"
                                                                    checked={isJobSelected(job[1])}
                                                                    onChange={() => toggleJobSelection(job[1])}
                                                                />
                                                            </label>
                                                        </th>
                                                        <td>
                                                            <div
                                                                className="tooltip"
                                                                data-tip={
                                                                    listPublicJobs ? "Cannot modify public jobs" : (
                                                                        `Click to switch to ${job[0] === "Private" ? "Public" : "Private"}`
                                                                    )
                                                                }>
                                                                {job[0] === "Private" ?
                                                                    <button
                                                                        className={`badge badge-primary badge-outline gap-2 transition-colors ${
                                                                            listPublicJobs ? "opacity-50 cursor-not-allowed" : (
                                                                                "hover:bg-primary/10 cursor-pointer"
                                                                            )
                                                                        }`}
                                                                        onClick={() => !listPublicJobs && switchPublicity(job[1])}
                                                                        disabled={listPublicJobs}>
                                                                        <LockClosedIcon className="w-4 h-4" />
                                                                        <span className="hidden sm:inline">Private</span>
                                                                    </button>
                                                                :   <button
                                                                        className={`badge badge-primary badge-outline gap-2 transition-colors ${
                                                                            listPublicJobs ? "opacity-50 cursor-not-allowed" : (
                                                                                "hover:bg-primary/10 cursor-pointer"
                                                                            )
                                                                        }`}
                                                                        onClick={() => !listPublicJobs && switchPublicity(job[1])}
                                                                        disabled={listPublicJobs}>
                                                                        <EyeIcon className="w-4 h-4" />
                                                                        <span className="hidden sm:inline">Public</span>
                                                                    </button>
                                                                }
                                                            </div>
                                                        </td>

                                                        <td className="font-medium">
                                                            <Link
                                                                href={`/result/${job[1]}`}
                                                                className="link link-primary link-hover font-semibold">
                                                                {job[1]}
                                                            </Link>
                                                        </td>

                                                        <td className="hidden sm:table-cell">
                                                            <div className="">{job[2]}</div>
                                                        </td>

                                                        <td className="hidden md:table-cell text-sm opacity-70">{job[3]}</td>

                                                        <td>{getStatusBadge(job[5])}</td>

                                                        <td>
                                                            <ActionButtons job={job} />
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            }
        </div>
    );
}
