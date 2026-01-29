"use client";

import { useEffect, useState } from "react";
import { generateSlug } from "random-word-slugs";
import axios from "axios";
import AlertSuccess from "../components/SuccessAlertWindow";
import AlertError from "../components/ErrorAlertWindow";
import { ChevronDoubleRightIcon } from "@heroicons/react/24/outline";

import { JobNameInput } from "@/app/components/JobNameInput";
import SequenceInput from "@/app/components/SequenceInput";
import TemplateDateInput from "@/app/components/alphafold/TemplateDateInput";
import PredictionsPerModelInput from "@/app/components/alphafold/PredictionsPerModelInput";
import DbPresetInput from "@/app/components/alphafold/DbPresetInput";
import ModelPresetInput from "@/app/components/alphafold/ModelPresetInput";
import EmailInput from "@/app/components/EmailInput";
import VersionInput from "../components/alphafold/VersionInput";
import CheckBoxGroup from "../components/alphafold/CheckBoxGroup";
import { BackHomeButton } from "../components/BackHomeButton";

export default function Alphafold() {
    const [email, setEmail] = useState("");
    const [jobName, setJobName] = useState(generateSlug(2));
    const [proteinSequence, setProteinSequence] = useState<string>("");
    const [maxTemplateDate, setMaxTemplateDate] = useState<string>("");
    const [predictionsPerModel, setPredictionsPerModel] = useState("5");
    const [dbPreset, setDbPreset] = useState<string>("full_dbs");
    const [modelPreset, setModelPreset] = useState<string>("monomer");
    const [version, setVersion] = useState<string>("Alphafold 2.3.1");
    const [forceComputation, setForceComputation] = useState<boolean>(false);
    const [runRelax, setRunRelax] = useState<boolean>(true);
    const [reuseMSAs, setReuseMSAs] = useState<boolean>(false);
    const [makeResultsPublic, setMakeResultsPublic] = useState<boolean>(false);

    const [submitErrorMessage, setSubmitErrorMessage] = useState<string>("");
    const [submitSuccessMessage, setSubmitSuccessMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors]: any = useState({});
    const [warnings, setWarnings]: any = useState({});
    const [isFormValid, setIsFormValid] = useState(false);

    const placeholder = `>Sequence1
MDSSSETSPAAPLRTIPGSYGIPFLQPIKDRLEYFYGKGGRDEYFHSRLQ
>Sequence2
EPRHAQLKNLLFFMLKSSSDRVIPQFETTYTELFQGLETELAKNGKAKFNDVGEQAAFRFLGRAYFNSNPEETKLGTSAPTLISSWVLFNLGPILDLGLPWFLEELLLHT`;

    useEffect(() => {
        validateForm();
    }, [jobName, proteinSequence, email, modelPreset]);

    const validateForm = () => {
        let errors: any = {};
        let warnings: any = {};

        if (!jobName) {
            errors.jobName = "Job name is required.";
        } else if (!/^[a-zA-Z0-9-]*$/.test(jobName)) {
            errors.jobName = "Only letters, numbers, and dashes (hyphens) are allowed.";
        }

        if (!proteinSequence) {
            errors.proteinSequence = "Protein sequence is required.";
        } else {
            const isFastaFormat = proteinSequence.trim().startsWith(">");

            if (isFastaFormat) {
                const sequences: string[] = proteinSequence.split("\n");
                if (sequences[1]?.length > 600) {
                    errors.proteinSequence =
                        "Individual protein sequence exceeds the maximum length of 600 amino acids. Consider using full Foldify version at https://foldify.cloud.e-infra.cz for longer sequences.";
                }

                if (sequences.length < 2) {
                    errors.proteinSequence = "Provide at least one amino acid sequence.";
                } else if (sequences.length > 2) {
                    if (modelPreset !== "multimer") {
                        warnings.proteinSequence =
                            "Seems like you provided more than one amino acid sequence. With Model Preset 'monomer' your protein sequence input will be run as batch of monomers. Please note, that if you want to predict a multimer, you need to select 'multimer' in the Model Preset dropdown.";
                    } else {
                        warnings.proteinSequence = "In 'multimer' mode each sequence must start with '>' character followed by sequence name.";
                    }
                }
            } else {
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
        setWarnings(warnings);
        setIsFormValid(Object.keys(errors).length === 0);
    };

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
            .post("/api/flask/alphafold/submit", {
                jobName: jobName,
                proteinSequence: finalSequence,
                maxTemplateDate: maxTemplateDate || null,
                predictionsPerModel: predictionsPerModel,
                dbPreset: dbPreset,
                modelPreset: modelPreset,
                email: email,
                version: version,
                forceComputation: forceComputation,
                runRelax: runRelax,
                reuseMSAs: reuseMSAs,
                makeResultsPublic: makeResultsPublic,
            })
            .then((response) => {
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

    const handleSubmit = () => {
        if (isFormValid) {
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
                    <h1 className="text-4xl font-bold text-primary mb-4">AlphaFold 2</h1>
                    <p className="text-md text-base-content/70 max-w-3xl mx-auto leading-relaxed">
                        Predict protein structures with state-of-the-art accuracy using AlphaFold 2. Configure your job parameters below and submit
                        for computation.
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
                                    placeholder={placeholder}
                                    onChange={setProteinSequence}
                                    errors={errors}
                                    warnings={warnings}
                                    jobName={jobName}
                                />
                            </section>

                            {/* Model Configuration Accordion */}
                            <section className="mb-8">
                                <div className="collapse collapse-arrow bg-base-100/10 border border-base-300">
                                    <input type="checkbox" />
                                    <div className="collapse-title text-xl font-semibold text-base-content flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                                            <span className="text-primary font-bold text-sm">3</span>
                                        </div>
                                        Model Configuration
                                    </div>
                                    <div className="collapse-content">
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                                            <ModelPresetInput
                                                modelPreset={modelPreset}
                                                onChange={setModelPreset}
                                            />
                                            <DbPresetInput
                                                dbPreset={dbPreset}
                                                onChange={setDbPreset}
                                            />
                                            <VersionInput
                                                version={version}
                                                onChange={setVersion}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Advanced Parameters Accordion */}
                            <section className="mb-8">
                                <div className="collapse collapse-arrow bg-base-100/10 border border-base-300">
                                    <input type="checkbox" />
                                    <div className="collapse-title text-xl font-semibold text-base-content flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                                            <span className="text-primary font-bold text-sm">4</span>
                                        </div>
                                        Advanced Parameters
                                    </div>
                                    <div className="collapse-content">
                                        <div className="pt-4">
                                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                                <TemplateDateInput
                                                    templateDate={maxTemplateDate}
                                                    onChange={setMaxTemplateDate}
                                                />
                                                <PredictionsPerModelInput
                                                    predictionsPerModel={predictionsPerModel}
                                                    onChange={setPredictionsPerModel}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <CheckBoxGroup
                                forceComputation={forceComputation}
                                makeResultsPublic={makeResultsPublic}
                                runRelax={runRelax}
                                reuseMSAs={reuseMSAs}
                                onForceComputationChange={setForceComputation}
                                onMakeResultsPublicChange={setMakeResultsPublic}
                                onRunRelaxChange={setRunRelax}
                                onReuseMsasChange={setReuseMSAs}
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
