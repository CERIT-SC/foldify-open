import { useState, useEffect } from "react";
import { ArrowDownTrayIcon, CircleStackIcon, CodeBracketIcon, BeakerIcon, DocumentIcon, FolderOpenIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import ErrorAlertWindow from "@/app/components/ErrorAlertWindow";

interface FileItem {
    name: string;
    size: string;
    type: "json" | "fasta" | "yaml" | "pdb" | "log" | "zip" | "png" | "txt" | "cif" | "csv" | "md" | "other";
    downloadUrl: string;
}

interface FilesProps {
    service: string;
    jobName: string;
    downloadJob: (jobName: string) => void;
}

export default function Files({ service, jobName, downloadJob }: FilesProps) {
    const token = "token"; // TODO: Replace with actual token retrieval logic

    const [inputFiles, setInputFiles] = useState<FileItem[]>([]);
    const [outputFiles, setOutputFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloadError, setDownloadError] = useState<string>("");

    // Fetch files list from API
    useEffect(() => {
        const fetchFiles = async () => {
            if (!token || service === "-") {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`/api/flask/result/${jobName}/files`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setInputFiles(response.data.inputFiles || []);
                setOutputFiles(response.data.outputFiles || []);
            } catch (err: any) {
                console.error("Error fetching files:", err);
                const errorMessage = err.response?.data?.error || "Failed to load files";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, [jobName, token, service]);

    const getFileIcon = (type: string) => {
        switch (type) {
            case "json":
                return <CodeBracketIcon className="w-5 h-5 text-primary" />;
            case "fasta":
                return <CircleStackIcon className="w-5 h-5 text-success" />;
            case "pdb":
            case "cif":
                return <BeakerIcon className="w-5 h-5 text-secondary" />;
            default:
                return <DocumentIcon className="w-5 h-5 text-base-content/60" />;
        }
    };

    const handleDownload = async (file: FileItem) => {
        if (!token) return;

        try {
            const response = await axios.get(file.downloadUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                responseType: "blob",
            });

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error: any) {
            console.error("Download failed:", error);

            let errorMessage = `Failed to download ${file.name}.`;

            if (error.response?.status === 404) {
                errorMessage += " The file was not found on the server.";
            } else if (error.response?.status === 500) {
                errorMessage += " A server error occurred while downloading the file.";
            } else if (error.response?.status === 403) {
                errorMessage += " You do not have permission to access this file.";
            } else {
                errorMessage += " An unexpected error occurred.";
            }

            setDownloadError(errorMessage);

            // Show the error dialog
            const dialog = document.getElementById("file-download-error-dialog") as HTMLDialogElement;
            if (dialog) {
                console.log("Showing download error dialog");
                dialog.showModal();
            }
        }
    };

    const FileSection = ({ title, files, emptyMessage }: { title: string; files: FileItem[]; emptyMessage: string }) => (
        <div className="h-full">
            <h2 className="text-xl font-semibold text-base-content mb-6 flex items-center gap-3">
                {title}
                <div className="badge badge-outline badge-sm ml-2">
                    {files.length} {files.length === 1 ? "file" : "files"}
                </div>
            </h2>

            <div className="card bg-base-100/50 shadow-lg border border-base-300 h-full">
                <div className="card-body p-6">
                    {files.length === 0 ?
                        <div className="text-center py-12">
                            <DocumentIcon className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
                            <p className="text-base-content/60 text-lg font-medium mb-2">No Files Available</p>
                            <p className="text-base-content/40">{emptyMessage}</p>
                        </div>
                    :   <div className="space-y-3">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 rounded-3xl bg-base-100/70 border border-base-300/50 hover:bg-base-100 hover:shadow-md transition-all duration-200">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-base-content truncate">{file.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm text-base-content/60">{file.size}</span>
                                                <span className="text-base-content/40">•</span>
                                                <div className="badge badge-ghost badge-sm">{file.type.toUpperCase()}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDownload(file)}
                                        className="btn btn-primary btn-sm transition ease-in-out hover:scale-105">
                                        <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                                        Download
                                    </button>
                                </div>
                            ))}
                        </div>
                    }
                </div>
            </div>
        </div>
    );

    if (service === "-") {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center py-16">
                    <FolderOpenIcon className="w-20 h-20 text-base-content/20 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-base-content mb-3">No Files Available</h2>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center py-16">
                    <div className="loading loading-spinner loading-lg text-primary"></div>
                    <p className="text-base-content/60 mt-4">Loading files...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center py-16">
                    <DocumentIcon className="w-20 h-20 text-error/60 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-error mb-3">Error Loading Files</h2>
                    <p className="text-base-content/60">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 mt-8">
                <FileSection
                    title="Input Files"
                    files={inputFiles}
                    emptyMessage="No input files available for this job"
                />

                <FileSection
                    title="Output Files"
                    files={outputFiles}
                    emptyMessage="No output files available for this job"
                />
            </div>

            {/* Use existing downloadJob function for download all */}
            <section className="mt-12 pt-8 border-t border-base-300">
                <div className="text-center">
                    <button
                        onClick={() => downloadJob(jobName)}
                        className="btn btn-primary btn-lg hover:scale-110 px-6 py-3 transition-all duration-200 shadow-lg">
                        <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                        Download Results
                    </button>
                    <p className="text-sm text-base-content/60 mt-4">Download all files as a compressed archive</p>
                </div>
            </section>

            {/* Error Alert Dialog for Download Failures */}
            <ErrorAlertWindow
                errorAlertMessage={downloadError}
                id="file-download-error-dialog"
            />
        </div>
    );
}
