interface JobInfoHeaderProps {
    jobInfo: {
        job_name: string;
        state: string;
        service: string;
        start: string;
        publicity?: string;
    };
    downloadJob: (jobName: string) => void;
    switchPublicity: () => void;
}

export default function JobInfoHeader({ jobInfo, downloadJob, switchPublicity }: JobInfoHeaderProps) {
    const { job_name, state, service, start } = jobInfo;

    return (
        <div className="hero p-8">
            <div>
                {/* Job Title */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-light">
                        Job <span className="font-bold text-primary">{jobInfo.job_name}</span>
                    </h1>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-linear-to-br from-violet-100 to-transparent p-4 rounded-3xl shadow-lg">
                        <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">State</div>
                        <div className="text-lg font-semibold">{state}</div>
                    </div>

                    <div className="bg-linear-to-br from-violet-100 to-transparent p-4 rounded-3xl shadow-lg">
                        <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Service</div>
                        <div className="text-lg font-semibold ">{jobInfo.service}</div>
                    </div>

                    <div className="bg-linear-to-br from-violet-100 to-transparent p-4 rounded-3xl shadow-lg">
                        <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Start</div>
                        <div className="text-lg font-semibold ">{jobInfo.start}</div>
                    </div>

                    <div className="bg-linear-to-br from-violet-100 to-transparent p-4 rounded-3xl shadow-lg">
                        <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Publicity</div>
                        <div className="text-lg font-semibold ">{jobInfo.publicity}</div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button
                        className="btn btn-outline border-2 hover:scale-110 px-6 py-3 transition-all duration-200 shadow-lg"
                        onClick={switchPublicity}>
                        <span className="font-medium">{jobInfo.publicity === "Public" ? "Make Private" : "Make Public"}</span>
                    </button>

                    <button
                        className="btn btn-primary hover:scale-110 px-6 py-3 transition-all duration-200 shadow-lg"
                        onClick={() => downloadJob(jobInfo.job_name)}>
                        <span className="font-medium">Download Results</span>
                        <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24">
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 13V4M7 14H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2m-1-5-4 5-4-5m9 8h.01"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
