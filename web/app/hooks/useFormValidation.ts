import {useEffect, useState} from "react";

export const useFormValidation = (jobName: string, modelSeeds: string, sequences: any[], email: string) => {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [warnings, setWarnings] = useState<Record<string, string>>({});
    const [isFormValid, setIsFormValid] = useState<boolean>(false);

    useEffect(() => {
        validateForm();
    }, [jobName, modelSeeds, sequences, email]);

    const validateForm = () => {
        let errors: Record<string, string> = {};

        if (!jobName) {
            errors.jobName = "Job Name is required";
        } else if (!/^[a-zA-Z0-9-]*$/.test(jobName)) {
            errors.jobName = "Only letters, numbers, and dashes are allowed.";
        }

        if (!modelSeeds) {
            errors.modelSeeds = "Model Seeds is required";
        } else if (!/^(\d+,)*\d+$/.test(modelSeeds)) {
            errors.modelSeeds = "Use comma-separated integers without spaces.";
        }

        if (!email) {
            errors.email = "Email is required";
        } else if (!/\b[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+\b/.test(email)) {
            errors.email = "Invalid email format";
        }

        sequences.forEach((sequence, index) => {
            if (!sequence.input) {
                errors[`input-${index}`] = "Entity input is required";
            }

            if (sequence.copies && !/^[A-Z,]*$/.test(sequence.copies)) {
                errors[`copies-${index}`] = "Use comma-separated uppercase letters without spaces.";
            }

            if (!sequence.copies) {
                errors[`copies-${index}`] = "Copy IDs are required";
            }

            if (sequence.type === "protein" || sequence.type === "rna" || sequence.type === "dna") {
                if (!/^[A-Z]*$/.test(sequence.input)) {
                    errors[`input-${index}`] = "Use uppercase letters without spaces.";
                }
            }
        });

        let warnings: Record<string, string> = {};
        sequences.forEach((sequence, index) => {
            let totalLength = 0;
            if (sequence.input) {
                let seqLength = sequence.input.length * (sequence.copies ? sequence.copies.split(",").length : 1);
                totalLength += seqLength;
            }

            if (totalLength > 600) {
                warnings[`input-${index}`] =
                    "Your sequence contains **" +
                    totalLength +
                    "** tokens, which exceeds the limit of **600 tokens** in the open version of Foldify Prediction Platform. Consider using full version of Foldify at **[https://foldify.cloud.e-infra.cz](https://foldify.cloud.e-infra.cz)**. Valid MetaCenter account is required - apply **[here](https://metavo.metacentrum.cz/cs/application/index.html)**.";
                errors[`input-${index}`] = "Sequence exceeds the maximum allowed length of 600 tokens.";
            }
        });

        setErrors(errors);
        setWarnings(warnings);
        setIsFormValid(Object.keys(errors).length === 0);
    };

    return {errors, isFormValid, warnings};
};
