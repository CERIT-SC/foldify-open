import {useState} from "react";
import axios from "axios";

export const useJobDownload = () => {
    const [downloadErrorMessage, setDownloadErrorMessage] = useState<string>("");

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

    const checkDownloadAvailability = async (jobName: string) => {
        try {
            const response = await axios.get(`/api/flask/download/zip_available/${jobName}`);
            handleDownload(jobName, response.data.username);
        } catch (error: any) {
            if (error.response) {
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
    };
};
