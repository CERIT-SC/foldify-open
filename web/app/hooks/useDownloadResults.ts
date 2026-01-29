import {useState} from "react";
import axios, {CancelTokenSource} from "axios";

export const useJobDownload = () => {
    const [downloadErrorMessage, setDownloadErrorMessage] = useState<string>("");

    let cancelDownloadToken: CancelTokenSource | null = null;
    const cancelDownload = () => {
        if (cancelDownloadToken) {
            cancelDownloadToken.cancel("Download cancelled by user.");
            cancelDownloadToken = null;
        }
    };

    const handleDownload = (jobName: string, username: string) => {

        const form = document.createElement("form");
        form.method = "POST";
        form.action = `/api/flask/download/download_zip/${jobName}`;

        const usernameInput = document.createElement("input");
        usernameInput.type = "hidden";
        usernameInput.name = "username";
        usernameInput.value = username;
        form.appendChild(usernameInput);

        document.body.appendChild(form);
        form.submit();

        document.body.removeChild(form);
    };

    const [downloadAvailable, setDownloadAvailable] = useState<boolean>(false);
    const checkDownloadAvailability = async (jobName: string) => {
        cancelDownloadToken = axios.CancelToken.source();
        try {
            const response = await axios.get(`/api/flask/download/zip_available/${jobName}`);
            setDownloadAvailable(response.data.download);
            handleDownload(jobName, response.data.username);
        } catch (error: any) {
            if (axios.isCancel(error)) {
                console.log("Request cancelled", error.message);
            } else if (error.response) {
                const errorMessage = error.response.data.error || JSON.stringify(error.response.data);
                console.log(errorMessage);
                setDownloadErrorMessage(errorMessage);
            } else if (error.request) {
                console.log("No response received from the server.");
                setDownloadErrorMessage(error.request);
            } else {
                console.log(`An error occurred: ${error.message}`);
                setDownloadErrorMessage(`An error occurred: ${error.message}`);
            }
        }
    };
    return {
        downloadErrorMessage,
        handleDownload,
        checkDownloadAvailability,
        downloadAvailable,
        cancelDownload,
        setDownloadAvailable
    };
};
