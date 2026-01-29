import {useState} from "react";
import axios from "axios";

import {Job} from "@/app/types/alphafold3Types";

export const useJobSubmission = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [submitSuccessMessage, setSubmitSuccessMessage] = useState<string>("");
    const [submitErrorMessage, setSubmitErrorMessage] = useState<string>("");

    const submitJob = async (data: Job, ccdFile?: File) => {
        setIsLoading(true);
        setSubmitErrorMessage("");
        setSubmitSuccessMessage("");

        let formData = new FormData();
        if (ccdFile) {
            formData.append("data", JSON.stringify(data));
            formData.append("userCCDFile", ccdFile as File);
        } else {
            formData.append("data", JSON.stringify(data));
        }
        console.log("Submitting job with data:", data);

        try {
            const response = await axios.post("/api/flask/alphafold3/v1/submit", formData);
            setSubmitSuccessMessage(response.data.message);
        } catch (error: any) {
            if (error.response) {
                setSubmitErrorMessage(error.response.data.error || JSON.stringify(error.response.data));
            } else if (error.request) {
                setSubmitErrorMessage("No response received from the server.");
            } else {
                setSubmitErrorMessage(`An error occurred: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const [submitJsonSuccessMessage, setSubmitJsonSuccessMessage] = useState<string>("");
    const [submitJsonErrorMessage, setSubmitJsonErrorMessage] = useState<string>("");

    const submitJsonJob = async (
        jobName: string,
        file: File,
        makeResultsPublic: boolean,
        forceComputation: boolean,
        largeInput: boolean,
        email: string
    ) => {
        setIsLoading(true);
        setSubmitJsonErrorMessage("");
        setSubmitJsonSuccessMessage("");

        const formData = new FormData();
        formData.append(
            "data",
            JSON.stringify({
                name: jobName,
                public: makeResultsPublic,
                email: email,
                forceComputation: forceComputation,
                largeInput: largeInput
            })
        );
        formData.append("jsonFile", file as File);

        try {
            const response = await axios.post("/api/flask/alphafold3/v1/submit/json", formData);
            console.log(response);
            console.log(response.data.message);
            setSubmitJsonSuccessMessage(response.data.message);
        } catch (error: any) {
            if (error.response) {
                console.log(error.response.data.error);
                setSubmitJsonErrorMessage(error.response.data.error || JSON.stringify(error.response.data));
            } else if (error.request) {
                console.log(error.request);
                setSubmitJsonErrorMessage("No response received from the server.");
            } else {
                console.log(error.message);
                setSubmitJsonErrorMessage(`An error occurred: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        submitSuccessMessage,
        submitErrorMessage,
        submitJob,
        submitJsonJob,
        submitJsonErrorMessage,
        submitJsonSuccessMessage
    };
};
