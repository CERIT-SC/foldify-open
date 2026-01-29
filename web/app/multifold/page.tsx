"use client";

import { useEffect, useState } from "react";
import AlertSuccess from "../components/SuccessAlertWindow";
import AlertError from "../components/ErrorAlertWindow";
import { generateSlug } from "random-word-slugs";
import { ChevronDoubleRightIcon } from "@heroicons/react/24/outline";

// Form Input Components
import { JobNameInput } from "../components/JobNameInput";
import SequenceInput from "../components/SequenceInput";
import EmailInput from "../components/EmailInput";
import PredictionToolSelector from "../components/multifold/PredictionToolSelector";
import { BasicCheckBoxGroup } from "../components/BasicCheckboxGroup";
import { submitMultiFoldJobs, getDefaultToolConfigs, MultiFoldConfig } from "../utils/multifold/apiSubmission";
import { BackHomeButton } from "../components/BackHomeButton";

export default function MultiFold() {
    const [jobName, setJobName] = useState<string>(generateSlug(2));
    const [email, setEmail] = useState<string>("");
    const [sequence, setSequence] = useState<string>("MALWMRLLPLLALLALWGPDPAAAFVNQHLCGSHLVEALYLVCGERGFFYTPKTRREAEDLQVGQVELGG");
    const [forceComputation, setForceComputation] = useState<boolean>(false);
    const [makeResultsPublic, setMakeResultsPublic] = useState<boolean>(false);
    const [selectedTools, setSelectedTools] = useState<string[]>([]);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFormValid, setIsFormValid] = useState<boolean>(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleToolSelectionChange = (tools: string[]) => {
        setSelectedTools(tools);
        console.log("Selected tools:", tools);
    };

    const [submitSuccessMessage, setSubmitSuccessMessage] = useState<string>("");
    const [submitErrorMessage, setSubmitErrorMessage] = useState<string>("");
    const handleSubmit = async () => {
        setIsLoading(true);
        setSubmitErrorMessage("");
        setSubmitSuccessMessage("");

        if (isFormValid) {
            const config: MultiFoldConfig = {
                jobName: `MULTIFOLD-${jobName}`,
                sequence,
                email: email,
                makeResultsPublic,
                forceComputation,
            };

            const toolConfigs = getDefaultToolConfigs();

            try {
                const results = await submitMultiFoldJobs(selectedTools, config, toolConfigs);

                // Process results
                const successfulSubmissions = results.filter((r) => r.success);
                const failedSubmissions = results.filter((r) => !r.success);

                if (successfulSubmissions.length > 0) {
                    const successMessage = `Successfully submitted jobs for: ${successfulSubmissions.map((r) => r.tool).join(", ")}`;
                    setSubmitSuccessMessage(successMessage);
                }

                if (failedSubmissions.length > 0) {
                    const errorMessage = `Failed to submit jobs for: ${failedSubmissions.map((r) => `${r.tool}: ${r.error}`).join("; ")}`;
                    setSubmitErrorMessage(errorMessage);
                }
            } catch (error: any) {
                console.error("Error occurred while submitting multi-fold jobs:", error);
                setSubmitErrorMessage("An unexpected error occurred while submitting jobs.");
            }
        }

        setIsLoading(false);
    };

    useEffect(() => {
        const errorModal = document?.getElementById("error_modal") as HTMLDialogElement;
        const successModal = document?.getElementById("success_modal") as HTMLDialogElement;
        if (submitErrorMessage) {
            errorModal.showModal();
        }

        if (submitSuccessMessage) {
            successModal.showModal();
        }
    }, [submitSuccessMessage, submitErrorMessage]);

    useEffect(() => {
        validateForm();
    }, [jobName, sequence, selectedTools, email]);

    const validateForm = () => {
        let errors: Record<string, string> = {};

        if (!jobName) {
            errors.jobName = "Job Name is required";
        } else if (!/^[a-zA-Z0-9-]*$/.test(jobName)) {
            errors.jobName = "Only letters, numbers, and dashes are allowed.";
        }

        if (sequence.trim() === "") {
            errors.proteinSequence = "Sequence is required.";
        } else if (sequence.length > 600) {
            errors.proteinSequence = "Sequence exceeds maximum length of 600 amino acids.";
        } else {
            if (!/^[A-Z]*$/.test(sequence)) {
                errors.proteinSequence = "Use uppercase letters without spaces and new lines.";
            }
        }

        if (!email || email.trim() === "") {
            errors.email = "Email is required.";
        } else if (!/\b[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+\b/.test(email)) {
            errors.email = "Invalid email format.";
        }

        if (selectedTools.length < 2) {
            errors.selectedTools = "At least two tools must be selected.";
        }

        setIsFormValid(Object.keys(errors).length === 0);
        setErrors(errors);
    };

    return (
        <>
            {/* Submission dialogs */}
            <AlertError
                id={"error_modal"}
                errorAlertMessage={submitErrorMessage}
            />
            <AlertSuccess
                id={"success_modal"}
                successAlertMessage={submitSuccessMessage}
                additionalInfo="You will receive an e-mail notification when the computation finishes."
            />

            <div className="container mx-auto px-4 py-8">
                <BackHomeButton />

                {/* Page Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-primary mb-4">MultiFold</h1>
                    <p className="text-md text-base-content/70 max-w-3xl mx-auto leading-relaxed">
                        Compare multiple protein structure prediction tools. Select at least 2 tools to run parallel predictions and compare results.
                    </p>
                </div>

                {/* Main Form */}
                <div className="max-w-6xl mx-auto">
                    <div className="card bg-white/50 shadow-2xl">
                        <div className="card-body p-8 md:p-12">
                            {/* Basic Information Section */}
                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-base-content mb-6 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <span className="text-primary font-bold text-sm">1</span>
                                    </div>
                                    Basic Information
                                </h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <JobNameInput
                                        jobName={jobName}
                                        onChange={setJobName}
                                        error={errors.jobName}
                                    />
                                    <EmailInput
                                        email={email}
                                        onChange={setEmail}
                                        error={errors.email}
                                    />
                                </div>
                                {/* Show preview of final job name */}
                                <div className="p-3 bg-white/50 rounded-3xl border">
                                    <span className="text-xs">Final job name: </span>
                                    <span className="font-mono font-medium text-xs text-primary">MULTIFOLD-{jobName}</span>
                                </div>
                            </section>

                            {/* Sequence Input Section */}
                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-base-content mb-6 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <span className="text-primary font-bold text-sm">2</span>
                                    </div>
                                    Protein Sequence
                                </h2>
                                <SequenceInput
                                    sequence={sequence}
                                    placeholder={sequence}
                                    onChange={setSequence}
                                    errors={errors}
                                    isMultiFold={true}
                                    info="Enter your amino acid sequence. The same sequence will be processed by all selected prediction tools for comparison."
                                />
                            </section>

                            {/* Prediction Tools Selection */}
                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-base-content mb-6 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <span className="text-primary font-bold text-sm">3</span>
                                    </div>
                                    Prediction Tools
                                </h2>

                                <PredictionToolSelector
                                    onSelectionChange={handleToolSelectionChange}
                                    selectedTools={selectedTools}
                                />
                                {errors.selectedTools && <div className="text-error text-sm mt-2 text-center">{errors.selectedTools}</div>}
                            </section>

                            <BasicCheckBoxGroup
                                forceComputation={forceComputation}
                                makeResultsPublic={makeResultsPublic}
                                onForceComputationChange={setForceComputation}
                                onMakeResultsPublicChange={setMakeResultsPublic}
                            />

                            {/* Submit Section */}
                            <div className="mt-12 pt-8 border-t border-base-300">
                                <div className="text-center">
                                    <button
                                        className={`btn btn-lg rounded-2xl shadow-lg transition-all duration-200 ${
                                            isFormValid && !isLoading ?
                                                "btn-primary hover:shadow-xl transform hover:-translate-y-0.5"
                                            :   "btn-disabled"
                                        }`}
                                        disabled={!isFormValid || isLoading}
                                        onClick={handleSubmit}>
                                        {isLoading ?
                                            <>
                                                <span className="loading loading-spinner loading-sm"></span>
                                                Submitting Jobs...
                                            </>
                                        :   <>
                                                <ChevronDoubleRightIcon className="w-5 h-5 mr-2" />
                                                Submit Jobs
                                            </>
                                        }
                                    </button>
                                    <p className="text-sm text-base-content/60 mt-4">You will receive an email notification when all jobs complete</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
