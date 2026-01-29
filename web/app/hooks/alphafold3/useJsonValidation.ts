import {useEffect, useState} from "react";

export const useJsonValidation = (jsonFile: File | null, jobName: string, email: string) => {
    const [errorsJson, setErrorsJson]: any = useState({});
    const [isFileValid, setIsFileValid] = useState<boolean>(false);

    useEffect(() => {
        validateJsonForm();
    }, [jsonFile, jobName, email]);

    const validateJsonForm = () => {
        let errorsJson: any = {};

        const jsonInput = document.getElementById("json_file_input") as HTMLInputElement;
        const jsonFileFromInput = jsonInput?.files?.[0];
        console.log(jsonFileFromInput);

        if (!jsonFileFromInput) {
            errorsJson.jsonFile = "JSON file is required.";
        } else if (!jsonFileFromInput.name.endsWith(".json")) {
            errorsJson.jsonFile = "Invalid file format. Please upload a JSON file.";
        }

        if (!jobName || jobName.trim() === "") {
            errorsJson.jobName = "Job name is required.";
        } else if (jobName.match(/[^a-zA-Z0-9-]/)) {
            errorsJson.jobName = "Job name contains invalid characters. Only letters, numbers, and hyphens are allowed.";
        }

        if (!email || email.trim() === "") {
            errorsJson.email = "Email is required.";
        } else if (!/\b[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+\b/.test(email)) {
            errorsJson.email = "Invalid email format.";
        }

        setErrorsJson(errorsJson);
        setIsFileValid(Object.keys(errorsJson).length === 0);
    };

    return {errorsJson, isFileValid};
};
