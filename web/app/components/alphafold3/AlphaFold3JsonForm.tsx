import { useState } from "react";
import { FileUpload } from "./FileUpload";
import { useJsonValidation } from "@/app/hooks/alphafold3/useJsonValidation";
import { useJobSubmission } from "@/app/hooks/alphafold3/useJobSubmission";
import { CheckBoxGroup } from "./AF3CheckBoxGroup";
import AlertSuccess from "@/app/components/SuccessAlertWindow";
import AlertError from "@/app/components/ErrorAlertWindow";
import { useEffect } from "react";
import { JobNameInput } from "../JobNameInput";
import { generateSlug } from "random-word-slugs";
import EmailInput from "@/app/components/EmailInput";

export const AlphaFold3JsonForm = () => {
    const [jobName, setJobName] = useState<string>(generateSlug(2));
    const [email, setEmail] = useState<string>("");
    const [makeResultsPublic, setMakeResultsPublic] = useState<boolean>(true);
    const [forceComputation, setForceComputation] = useState<boolean>(false);
    const [largeInput, setLargeInput] = useState<boolean>(false);
    const [jsonFile, setJsonFile] = useState<File | null>(null);

    const { errorsJson, isFileValid } = useJsonValidation(jsonFile, jobName, email);

    const { isLoading, submitJsonJob, submitJsonErrorMessage, submitJsonSuccessMessage } = useJobSubmission();

    const handleJsonSubmit = () => {
        if (isFileValid && jsonFile) {
            submitJsonJob(jobName, jsonFile, makeResultsPublic, forceComputation, largeInput, email);
        }
    };

    useEffect(() => {
        if (submitJsonErrorMessage) {
            console.log(submitJsonErrorMessage);
            const jsonErrorModal = document?.getElementById("json_error_modal") as HTMLDialogElement;
            jsonErrorModal.showModal();
        }

        if (submitJsonSuccessMessage) {
            console.log(submitJsonSuccessMessage);
            const jsonSuccessModal = document?.getElementById("json_success_modal") as HTMLDialogElement;
            jsonSuccessModal.showModal();
        }
    }, [submitJsonSuccessMessage, submitJsonErrorMessage]);

    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-xl font-semibold text-base-content flex items-center gap-3">JSON Configuration File</h2>

                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <JobNameInput
                                jobName={jobName}
                                onChange={setJobName}
                                error={errorsJson.jobName}
                            />
                            <div className="p-2 bg-base-100/30 border border-base-300/50 rounded-md">
                                <p className="text-xs text-base-content/60 leading-tight">
                                    This name will overwrite the name stated inside the JSON file.
                                </p>
                            </div>
                        </div>

                        <EmailInput
                            email={email}
                            onChange={setEmail}
                            error={errorsJson.email}
                        />
                    </div>

                    <FileUpload
                        id="json_file_input"
                        onChange={(jsonFile) => setJsonFile(jsonFile)}
                        error={errorsJson.jsonFile}
                    />

                    <div className="mt-3 p-2 bg-base-100/30 border border-base-300/50 rounded-md">
                        <p className="text-xs text-base-content/60 leading-tight">
                            Upload a JSON file with{" "}
                            <a
                                href="https://github.com/google-deepmind/alphafold3/blob/main/docs/input.md#top-level-structure"
                                className="underline text-primary font-bold hover:text-secondary-focus"
                                target="_blank">
                                AlphaFold3 format
                            </a>{" "}
                            for computation. Upload supports also <i>alphafoldserver</i> JSON format files, but make sure to upload only single job in
                            the file. Multiple jobs in one JSON file are not supported.
                        </p>
                    </div>
                </div>
            </section>

            <CheckBoxGroup
                forceComputation={forceComputation}
                makeResultsPublic={makeResultsPublic}
                onForceComputationChange={setForceComputation}
                onMakeResultsPublicChange={setMakeResultsPublic}
            />

            {/* Display success/error messages */}
            <AlertError
                id={"json_error_modal"}
                errorAlertMessage={submitJsonErrorMessage}
            />
            <AlertSuccess
                id={"json_success_modal"}
                successAlertMessage={submitJsonSuccessMessage}
                additionalInfo="You will receive an e-mail notification when the computation finishes."
            />
        </div>
    );
};
