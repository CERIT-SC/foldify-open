import {useMemo} from "react";

export const useJsonValidation = (jsonFile: File | null, jobName: string, email: string) => {
    return useMemo(() => {
        let errorsJson: any = {};

        if (!jsonFile) {
            errorsJson.jsonFile = "JSON file is required.";
        } else if (!jsonFile.name.endsWith(".json")) {
            errorsJson.jsonFile = "Invalid file format. Please upload a JSON file.";
        }

        if (!jobName || jobName.trim() === "") {
            errorsJson.jobName = "Job name is required.";
        } else if (jobName.match(/[^a-zA-Z0-9-]/)) {
            errorsJson.jobName = "Job name contains invalid characters. Only letters, numbers, and hyphens are allowed.";
        }

        if (!email || email.trim() === "") {
            errorsJson.email = "Email is required.";
        } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            errorsJson.email = "Invalid email format.";
        }

        return {errorsJson, isFileValid: Object.keys(errorsJson).length === 0};
    }, [jsonFile, jobName, email]);
};
