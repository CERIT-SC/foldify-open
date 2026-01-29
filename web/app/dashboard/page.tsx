"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import DeleteJobModal from "../components/DeleteJobModal";
import DeleteMultiJobsModal from "@/app/components/DeleteMultiJobsModal";
import SuccessAlertWindow from "../components/SuccessAlertWindow";
import ErrorAlertWindow from "../components/ErrorAlertWindow";
import ToolCards from "@/app/components/dashboard/ToolCards";
import { useJobDownload } from "@/app/hooks/useDownloadResults";
import ComputedJobsTable from "@/app/components/dashboard/ComputedJobsTable";
import HeroSection from "@/app/components/dashboard/HeroSection";
import ExampleCards from "@/app/components/dashboard/ExampleCards";

// Define the structure of a job
interface Job {
    0: string; // Job publicity
    1: string; // Job name
    2: string; // Service
    3: string; // Start date
    4: string; // Result as Success or Failed
}

export default function Dashboard() {
    const [loadingTable, setLoadingTable] = useState<boolean>(false);

    useEffect(() => {
        loadJobTable();
    }, []);

    const [listPublicJobs, setListPublicJobs] = useState<boolean>(false);
    const [jobs, setJobs] = useState<Job[]>([]);

    const loadJobTable = () => {
        setLoadingTable(true);

        if (listPublicJobs) {
            axios
                .get(`/api/flask/dashboard/public_jobs`)
                .then((response) => response.data)
                .then((data) => {
                    setJobs(data.jobs);
                    setLoadingTable(false);
                })
                .catch(function (error) {
                    console.log(error);
                    setLoadingTable(false);
                });
        } else {
            axios
                .get(`/api/flask/dashboard/user_jobs`)
                .then((response) => response.data)
                .then((data) => {
                    setJobs(data.jobs);
                    setLoadingTable(false);
                })
                .catch(function (error) {
                    console.log(error);
                    setLoadingTable(false);
                });
        }
    };

    useEffect(() => {
        loadJobTable();
    }, [listPublicJobs]);

    // -------------------------- DOWNLOAD -------------------------------
    const { downloadErrorMessage, checkDownloadAvailability, downloadAvailable, setDownloadAvailable } = useJobDownload();

    const downloadJob = (jobName: string) => {
        checkDownloadAvailability(jobName);
    };

    useEffect(() => {
        if (downloadAvailable) {
            setDownloadAvailable(false);
        }
    }, [downloadAvailable]);

    useEffect(() => {
        if (downloadErrorMessage) {
            const downloadModal = document.getElementById("error_download") as HTMLDialogElement;
            downloadModal.showModal();
        }
    }, [downloadErrorMessage]);

    // ---------------------- DELETE JOB ------------------------
    const [selectedJob, setSelectedJob] = useState<string | null>(null);
    const openDeleteJobModal = (jobName: string) => {
        const deleteJobModalElement = document.getElementById("delete_job_modal") as HTMLDialogElement;

        if (deleteJobModalElement) {
            deleteJobModalElement.showModal();
        }
        setSelectedJob(jobName);
    };

    const closeDeleteJobModal = () => {
        console.log("Closing delete job modal");
        setSelectedJob(null);

        const deleteJobModalElement = document.getElementById("delete_job_modal") as HTMLDialogElement;
        if (deleteJobModalElement) {
            deleteJobModalElement.close();
        }
    };

    const confirmDeleteJob = () => {
        if (selectedJob) {
            deleteJob(selectedJob);
        }
        closeDeleteJobModal();
    };

    const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string>("");
    const [deleteErrorMessage, setDeleteErrorMessage] = useState<string>("");

    const deleteJob = (jobName: string) => {
        console.log("Deleting job: ", jobName);

        const successModal = document.getElementById("success_modal") as HTMLDialogElement;
        const errorModal = document.getElementById("error_modal") as HTMLDialogElement;

        axios
            .delete(`/api/flask/dashboard/delete/${jobName}`)
            .then((response) => response.data)
            .then((data) => {
                console.log(data.message);
                setDeleteSuccessMessage(data.message);
                successModal.showModal();
                loadJobTable();
            })
            .catch(function (error) {
                const errorMessage = error.response.data.error || JSON.stringify(error.response.data);
                setDeleteErrorMessage(errorMessage);
                errorModal.showModal();
                console.log(error);
            });
    };

    const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
    const [runningJobsError, setRunningJobsError] = useState<boolean>(false);
    const openMultiDeleteModal = (selectedJobs: string[], runningJobsError: boolean) => {
        console.log("Opening multi delete modal");
        console.log("Selected jobs:", selectedJobs);
        const deleteMultiJobsModalElement = document.getElementById("delete_multi_jobs_modal") as HTMLDialogElement;
        setRunningJobsError(runningJobsError);

        if (deleteMultiJobsModalElement) {
            deleteMultiJobsModalElement.showModal();
        }
        setSelectedJobs(selectedJobs);
    };

    const closeMultiDeleteModal = () => {
        setSelectedJobs([]);

        const deleteMultiJobsModalElement = document.getElementById("delete_multi_jobs_modal") as HTMLDialogElement;
        if (deleteMultiJobsModalElement) {
            deleteMultiJobsModalElement.close();
        }
    };

    const [deletionLoading, setDeletionLoading] = useState<boolean>(false);
    const confirmMultiDeleteJobs = () => {
        console.log("Deleting multiple jobs: ", selectedJobs);
        if (selectedJobs.length > 0) {
            deleteMultipleJobs(selectedJobs);
        }
    };

    const deleteMultipleJobs = (jobNames: string[]) => {
        const successModal = document.getElementById("success_modal") as HTMLDialogElement;
        const errorModal = document.getElementById("error_modal") as HTMLDialogElement;

        setDeletionLoading(true);

        axios
            .delete(`/api/flask/dashboard/delete_multiple/${jobNames.join(",")}`)
            .then((response) => response.data)
            .then((data) => {
                console.log(data.message);
                setDeleteSuccessMessage(data.message);
                setDeletionLoading(false);
                closeMultiDeleteModal();
                successModal.showModal();
                loadJobTable();
            })
            .catch(function (error) {
                const errorMessage = error.response.data.error || JSON.stringify(error.response.data);
                setDeleteErrorMessage(errorMessage);
                setDeletionLoading(false);
                closeMultiDeleteModal();
                errorModal.showModal();
                console.log(error);
            });
    };

    // ---------------------- SWITCH PUBLICITY ------------------------
    const [switchPublicitySuccessMessage, setSwitchPublicitySuccessMessage] = useState<string>("");
    const [switchPublicityErrorMessage, setSwitchPublicityErrorMessage] = useState<string>("");

    const switchPublicity = (jobName: string) => {
        axios
            .get(`/api/flask/result/switch_publicity/${jobName}`)
            .then((response) => {
                console.log("Publicity switched successfully:", response.data);
                setSwitchPublicitySuccessMessage(response.data.message);
                const successModal = document.getElementById("success_switch_publicity") as HTMLDialogElement;
                successModal.showModal();
                loadJobTable();
            })
            .catch((error) => {
                console.error("Error switching publicity:", error.response?.data?.error || error.message);
                setSwitchPublicityErrorMessage(`Failed to switch publicity: ${error.response?.data?.error || error.message}`);
                const errorModal = document.getElementById("error_switch_publicity") as HTMLDialogElement;
                errorModal.showModal();
            });
    };

    return (
        <>
            <ErrorAlertWindow
                id={"error_modal"}
                errorAlertMessage={deleteErrorMessage}
            />
            <SuccessAlertWindow
                id={"success_modal"}
                successAlertMessage={deleteSuccessMessage}
                additionalInfo=""
            />
            <SuccessAlertWindow
                id={"success_switch_publicity"}
                successAlertMessage={switchPublicitySuccessMessage}
                additionalInfo=""
            />
            <ErrorAlertWindow
                id={"error_switch_publicity"}
                errorAlertMessage={switchPublicityErrorMessage}
            />
            <DeleteJobModal
                onConfirm={confirmDeleteJob}
                onClose={closeDeleteJobModal}
                jobName={selectedJob || ""}
            />
            <DeleteMultiJobsModal
                onConfirm={confirmMultiDeleteJobs}
                onClose={closeMultiDeleteModal}
                selectedJobs={selectedJobs}
                deleting={deletionLoading}
                runningJobsError={runningJobsError}
            />

            <ErrorAlertWindow
                errorAlertMessage={downloadErrorMessage}
                id="error_download"
            />

            <>
                <HeroSection />

                <ToolCards />

                <ComputedJobsTable
                    loading={loadingTable}
                    loadJobTable={loadJobTable}
                    jobs={jobs}
                    downloadJob={downloadJob}
                    openDeleteJobModal={openDeleteJobModal}
                    openMultiDeleteModal={openMultiDeleteModal}
                    listPublicJobs={listPublicJobs}
                    setListPublicJobs={setListPublicJobs}
                    switchPublicity={switchPublicity}
                />

                <ExampleCards />
            </>
        </>
    );
}
