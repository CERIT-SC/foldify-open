"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import AlertSuccess from "../components/SuccessAlertWindow";
import AlertError from "../components/ErrorAlertWindow";
import { generateSlug } from "random-word-slugs";
import { ChevronDoubleRightIcon } from "@heroicons/react/24/outline";

import { JobNameInput } from "../components/JobNameInput";
import SequenceInput from "../components/SequenceInput";
import EmailInput from "../components/EmailInput";
import AdvancedSettingsGroup from "../components/esmfold/AdvancedSettingsGroup";
import { BasicCheckBoxGroup } from "../components/BasicCheckboxGroup";
import { BackHomeButton } from "../components/BackHomeButton";

export default function ESMfold() {
    const [jobName, setJobName] = useState<string>(generateSlug(2));
    const [email, setEmail] = useState("");
    const sequence = `MDSSSETSPAAPLRTIPGSYGIPFLQPIKDRLEYFYGKGGRDEYFHSRLQ`;
    const [proteinSequence, setProteinSequence] = useState("");
    const [numRecycles, setNumRecycles] = useState("3");
    const [numCopies, setNumCopies] = useState("1");
    const [makeResultsPublic, setMakeResultsPublic] = useState(false);
    const [forceComputation, setForceComputation] = useState(false);

    const [submitErrorMessage, setSubmitErrorMessage] = useState("");
    const [submitSuccessMessage, setSubmitSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const runJob = () => {
        setIsLoading(true);

        const errorModal = document.getElementById("error_modal") as HTMLDialogElement;
        const successModal = document.getElementById("success_modal") as HTMLDialogElement;

        let finalSequence = proteinSequence;
        if (!proteinSequence.startsWith(">")) {
            const cleanSequence = proteinSequence.replace(/\s/g, "").toUpperCase();
            const randomNum = Math.floor(Math.random() * 1000);
            finalSequence = `>${jobName}-${randomNum}\n${cleanSequence}`;
        }

        axios
            .post("/api/flask/esmfold/submit", {
                jobName: jobName,
                proteinSequence: finalSequence, // Use the formatted sequence
                numCopies: numCopies,
                numRecycles: numRecycles,
                email: email,
                makeResultsPublic: makeResultsPublic,
                forceComputation: forceComputation,
            })
            .then((response) => {
                console.log(response.data.message);
                setSubmitSuccessMessage(response.data.message);
                successModal.showModal();
                setIsLoading(false);
            })
            .catch((error) => {
                if (error.response) {
                    const errorMessage = error.response.data.error || JSON.stringify(error.response.data);
                    setSubmitErrorMessage(errorMessage);
                    errorModal.showModal();
                    setIsLoading(false);
                } else if (error.request) {
                    setSubmitErrorMessage("No response received from the server.");
                    errorModal.showModal();
                    setIsLoading(false);
                } else {
                    setSubmitErrorMessage(`An error occurred: ${error.message}`);
                    errorModal.showModal();
                    setIsLoading(false);
                }
            });
    };

    const [errors, setErrors]: any = useState({});
    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        validateForm();
    }, [jobName, proteinSequence, email]);

    // Validate form
    const validateForm = () => {
        let errors: any = {};

        if (!jobName) {
            errors.jobName = "Job name is required.";
        } else if (!/^[a-zA-Z0-9-]*$/.test(jobName)) {
            errors.jobName = "Only letters, numbers, and dashes (hyphens) are allowed.";
        }

        if (!proteinSequence) {
            errors.proteinSequence = "Protein sequence is required.";
        } else {
            // Check if it's FASTA format or amino acid sequence
            const isFastaFormat = proteinSequence.trim().startsWith(">");

            if (isFastaFormat) {
                const sequences: string[] = proteinSequence.split("\n");
                if (sequences[1]?.length > 600) {
                    errors.proteinSequence =
                        "Individual protein sequence exceeds the maximum length of 600 amino acids. Consider using full Foldify version at https://foldify.cloud.e-infra.cz for longer sequences.";
                }

                if (sequences.length < 2) {
                    errors.proteinSequence = "Provide at least one amino acid sequence.";
                }
            } else {
                // Amino acid sequence validation (simple check)
                const cleanSequence = proteinSequence.replace(/\s/g, "");
                if (cleanSequence.length === 0) {
                    errors.proteinSequence = "Protein sequence cannot be empty.";
                }
                if (cleanSequence.length > 600) {
                    errors.proteinSequence =
                        "Protein sequence exceeds the maximum length of 600 amino acids. Consider using full Foldify version at https://foldify.cloud.e-infra.cz for longer sequences.";
                }
            }
        }

        if (!email) {
            errors.email = "Email is required.";
        } else if (!/\b[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+\b/.test(email)) {
            errors.email = "Email is invalid.";
        }

        setErrors(errors);
        setIsFormValid(Object.keys(errors).length === 0);
    };

    // Submit form
    const handleSubmit = () => {
        if (isFormValid) {
            console.log("Form is valid");
            runJob();
        } else {
            console.log("Form is invalid");
        }
    };

    return (
        <>
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
                    <h1 className="text-4xl font-bold text-primary mb-4">ESMFold</h1>
                    <p className="text-md text-base-content/70 max-w-3xl mx-auto leading-relaxed">
                        Fast protein structure prediction with ESMFold. Configure your job parameters below and submit for computation.
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
                                    sequence={proteinSequence}
                                    placeholder={sequence}
                                    onChange={setProteinSequence}
                                    errors={errors}
                                    jobName={jobName}
                                />
                            </section>

                            {/* Advanced Settings Accordion */}
                            <section className="mb-8">
                                <div className="collapse collapse-arrow bg-base-100/10 border border-base-300">
                                    <input type="checkbox" />
                                    <div className="collapse-title text-xl font-semibold text-base-content flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                                            <span className="text-primary font-bold text-sm">3</span>
                                        </div>
                                        Advanced Settings
                                    </div>
                                    <div className="collapse-content">
                                        <div className="pt-4">
                                            <AdvancedSettingsGroup
                                                numCopies={numCopies}
                                                onChangeNumCopies={setNumCopies}
                                                numRecycles={numRecycles}
                                                onChangeNumRecycles={setNumRecycles}
                                            />
                                        </div>
                                    </div>
                                </div>
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
                                                Submitting Job...
                                            </>
                                        :   <>
                                                <ChevronDoubleRightIcon className="w-5 h-5 mr-2" />
                                                Submit Job
                                            </>
                                        }
                                    </button>
                                    <p className="text-sm text-base-content/60 mt-4">
                                        You will receive an email notification when your job completes
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
