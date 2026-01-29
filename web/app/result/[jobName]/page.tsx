"use client";

import { Tabs, Tab } from "../../components/Tab";
import { useEffect, useState, use } from "react";
import { useJobData } from "@/app/hooks/result/useJobData";
import { useJobDownload } from "@/app/hooks/useDownloadResults";
import ErrorAlertWindow from "@/app/components/ErrorAlertWindow";
import { BackHomeButton } from "@/app/components/BackHomeButton";
import JobInfoHeader from "@/app/components/result/JobInfoHeader";
import GraphicalOutput from "@/app/components/result/GraphicalOutput";
import TechnicalOutput from "@/app/components/result/TechnicalOutput";
import SuccessAlertWindow from "@/app/components/SuccessAlertWindow";

import axios from "axios";
import Files from "@/app/components/result/Files";

interface ResultPageParams {
    jobName: string;
}

interface JobInfo {
    job_name: string;
    state: string;
    service: string;
    start: string;
    publicity?: string;
}

export default function Result({ params }: { params: Promise<ResultPageParams> }) {
    const { jobName } = use(params);
    const { fetchData, loadingPlddt } = useJobData(jobName);

    const [jobInfo, setJobInfo] = useState<JobInfo>({
        job_name: jobName,
        state: "",
        service: "",
        start: "",
        publicity: "",
    });
    const [stdout, setStdout] = useState<string>("");
    const [structureData, setStructureData] = useState<string>("");
    const [format, setFormat] = useState<string>("");
    const [molstarURL, setMolstarURL] = useState<string>("");
    const [plddtData, setPlddtData] = useState<any[]>([]);
    const [sequence, setSequence] = useState<string | Record<string, string>>("");

    useEffect(() => {
        fetchData("", setJobInfo);
        fetchData("/stdout", (data) => {
            setStdout(data.stdout);
        });
        fetchData("/molstar_url", (data) => {
            setMolstarURL(data.molstarURL);
        });
        fetchData("/plddt", (data) => {
            setPlddtData(data.plddt);
        });
        fetchData("/model", (data) => {
            setStructureData(data.model);
            setFormat(data.dataFormat);
        });
        fetchData("/sequence", (data) => {
            console.log("Fetched sequence data:", data.sequence, "Type:", data.type);
            setSequence(data.sequence);
        });
    }, []);

    // -------------------------- DOWNLOAD -------------------------------
    const { downloadErrorMessage, checkDownloadAvailability, downloadAvailable, setDownloadAvailable } = useJobDownload();

    // Trigger download of the job results
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

    const [switchPublicitySuccessMessage, setSwitchPublicitySuccessMessage] = useState<string>("");
    const [switchPublicityErrorMessage, setSwitchPublicityErrorMessage] = useState<string>("");
    const switchPublicity = () => {
        axios
            .get(`/api/flask/result/switch_publicity/${jobName}`)
            .then((response) => {
                console.log("Publicity switched successfully:", response.data);
                setSwitchPublicitySuccessMessage(response.data.message);
                const successModal = document.getElementById("success_switch_publicity") as HTMLDialogElement;
                successModal.showModal();
                fetchData("", setJobInfo);
            })
            .catch((error) => {
                console.error("Error switching publicity:", error.response.data.error);
                setSwitchPublicityErrorMessage("Failed to switch publicity: " + error.response.data.error);
                const errorModal = document.getElementById("error_switch_publicity") as HTMLDialogElement;
                errorModal.showModal();
                fetchData("", setJobInfo);
            });
    };

    return (
        <>
            <ErrorAlertWindow
                errorAlertMessage={downloadErrorMessage}
                id="error_download"
            />

            <SuccessAlertWindow
                successAlertMessage={switchPublicitySuccessMessage}
                id="success_switch_publicity"
                additionalInfo="Successfully switched publicity."
            />

            <ErrorAlertWindow
                errorAlertMessage={switchPublicityErrorMessage}
                id="error_switch_publicity"
            />

            <div className="mt-6 ml-10">
                <BackHomeButton />
            </div>

            <JobInfoHeader
                jobInfo={jobInfo}
                downloadJob={downloadJob}
                switchPublicity={switchPublicity}
            />

            <div className="container mx-auto px-4 py-8 rounded-4xl shadow-2xl bg-white/50">
                <Tabs>
                    <Tab label="Graphical Output">
                        <GraphicalOutput
                            structureData={structureData}
                            format={format}
                            molstarURL={molstarURL}
                            loadingPlddt={loadingPlddt}
                            plddtData={plddtData}
                            proteinSequence={sequence}
                            jobName={jobInfo.job_name}
                        />
                    </Tab>
                    <Tab label="Files">
                        <Files
                            service={jobInfo.service}
                            jobName={jobName}
                            downloadJob={downloadJob}
                        />
                    </Tab>
                    <Tab label="Technical Output">
                        <TechnicalOutput stdout={stdout} />
                    </Tab>
                </Tabs>
            </div>
        </>
    );
}
