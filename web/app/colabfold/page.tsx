"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import AlertSuccess from "../components/SuccessAlertWindow";
import AlertError from "../components/ErrorAlertWindow";
import { generateSlug } from "random-word-slugs";
import { ChevronDoubleRightIcon } from "@heroicons/react/24/outline";

import { JobNameInput } from "../components/JobNameInput";
import SequenceInput from "../components/SequenceInput";
import NumberOfRelaxInput from "../components/colabfold/NumberOfRelaxInput";
import TemplateModeInput from "../components/colabfold/TemplateModeInput";
import MSAOptionsGroup from "../components/colabfold/MSAOptionsGroup";
import AdvancedSettingsGroup from "../components/colabfold/AdvancedSettingsGroup";
import EmailInput from "../components/EmailInput";
import CheckBoxGroup from "../components/colabfold/CheckBoxGroup";
import ModelPresetInput from "../components/colabfold/ModelPresetInput";
import { BackHomeButton } from "../components/BackHomeButton";

export default function Colabfold() {
    const [email, setEmail] = useState("");

    const [jobName, setJobName] = useState<string>(generateSlug(2));
    const sequence = `>Sequence1\nMDSSSETSPAAPLQ:EPRHAQLQAAFRFLGRAYFNSNPEETKLLLLHT`;
    const [proteinSequence, setProteinSequence] = useState<string>("");
    const [templateMode, setTemplateMode] = useState("none");
    const [numRelax, setNumRelax] = useState("0");
    const [msaMode, setMsaMode] = useState("mmseqs2_uniref_env");
    const [pairMode, setPairMode] = useState("unpaired_paired");
    const [modelPreset, setModelPreset] = useState("alphafold2_ptm");
    const [numModels, setNumModels] = useState("5");
    const [numRecycles, setNumRecycles] = useState("3");
    const [recycleTolerance, setRecycleTolerance] = useState("auto");
    const [maxMSA, setMaxMSA] = useState("auto");
    const [numSeeds, setNumSeeds] = useState("1");
    const [version, setVersion] = useState("Colabfold 1.5.2");
    const [forceComputation, setForceComputation] = useState(false);
    const [makeResultsPublic, setMakeResultsPublic] = useState(false);
    const [useDropout, setUseDropout] = useState(false);

    const [submitErrorMessage, setSubmitErrorMessage] = useState("");
    const [submitSuccessMessage, setSubmitSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors]: any = useState({});
    const [isFormValid, setIsFormValid] = useState(false);

    const runJob = () => {
        setIsLoading(true);

        let finalSequence = proteinSequence;
        if (!proteinSequence.startsWith(">")) {
            const cleanSequence = proteinSequence.replace(/\s/g, "").toUpperCase();
            const randomNum = Math.floor(Math.random() * 1000);
            finalSequence = `>${jobName}-${randomNum}\n${cleanSequence}`;
        }

        axios
            .post("/api/flask/colabfold/submit", {
                jobName: jobName,
                proteinSequence: finalSequence,
                templateMode: templateMode,
                numRelax: numRelax,
                msaMode: msaMode,
                pairMode: pairMode,
                modelPreset: modelPreset,
                numModels: numModels,
                numRecycles: numRecycles,
                recycleTolerance: recycleTolerance,
                maxMSA: maxMSA,
                numSeeds: numSeeds,
                email: email,
                version: version,
                forceComputation: forceComputation,
                makeResultsPublic: makeResultsPublic,
                useDropout: useDropout,
            })
            .then((response) => {
                console.log(response.data.message);
                const successModal = document.getElementById("success_modal") as HTMLDialogElement;
                setSubmitSuccessMessage(response.data.message);
                successModal.showModal();
                setIsLoading(false);
            })
            .catch((error) => {
                const errorModal = document.getElementById("error_modal") as HTMLDialogElement;

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

    useEffect(() => {
        validateForm();
    }, [jobName, proteinSequence, email]);

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

    const handleSubmit = () => {
        if (isFormValid) {
            console.log("Form is valid.");
            runJob();
        } else {
            console.log("Form is invalid.");
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
                    <h1 className="text-4xl font-bold text-primary mb-4">ColabFold</h1>
                    <p className="text-md text-base-content/70 max-w-3xl mx-auto leading-relaxed">
                        Fast and accurate protein structure prediction using ColabFold. Configure your job parameters below and submit for
                        computation.
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
                                    info='Use `":"` to specify inter-protein chainbreaks for modeling complexes (supports homo- and hetero-oligomers). For example `PI...SK:PI...SK` for a homodimer. ~newline Be aware that ColabFold is case-sensitive, and a `":"` at the beginning or end of a line will cause a **computation failure**. Ideally, enter the sequence in a **single line** without any line breaks.'
                                />
                            </section>

                            {/* Model Preset Selection */}
                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-base-content mb-6 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <span className="text-primary font-bold text-sm">3</span>
                                    </div>
                                    Model Preset
                                </h2>
                                <ModelPresetInput
                                    modelPreset={modelPreset}
                                    onChange={setModelPreset}
                                />
                            </section>

                            {/* MSA Options Accordion */}
                            <section className="mb-8">
                                <div className="collapse collapse-arrow bg-base-100/10 border border-base-300">
                                    <input type="checkbox" />
                                    <div className="collapse-title text-xl font-semibold text-base-content flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                                            <span className="text-primary font-bold text-sm">4</span>
                                        </div>
                                        MSA Options
                                    </div>
                                    <div className="collapse-content overflow-visible">
                                        <div className="pt-4">
                                            <MSAOptionsGroup
                                                msaMode={msaMode}
                                                pairMode={pairMode}
                                                onChangeMSAMode={setMsaMode}
                                                onChangePairMode={setPairMode}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Advanced Settings Accordion */}
                            <section className="mb-8">
                                <div className="collapse collapse-arrow bg-base-100/10 border border-base-300">
                                    <input type="checkbox" />
                                    <div className="collapse-title text-xl font-semibold text-base-content flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                                            <span className="text-primary font-bold text-sm">5</span>
                                        </div>
                                        Advanced Settings
                                    </div>
                                    <div className="collapse-content ">
                                        <div className="pt-4 ">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <NumberOfRelaxInput
                                                    numberOfRelax={numRelax}
                                                    onChange={setNumRelax}
                                                />
                                                <TemplateModeInput
                                                    templateMode={templateMode}
                                                    onChange={setTemplateMode}
                                                />
                                            </div>
                                            <AdvancedSettingsGroup
                                                numModels={numModels}
                                                onNumModelsChange={setNumModels}
                                                numRecycles={numRecycles}
                                                onNumRecyclesChange={setNumRecycles}
                                                recycleTolerance={recycleTolerance}
                                                onRecycleToleranceChange={setRecycleTolerance}
                                                maxMSA={maxMSA}
                                                onMaxMSAChange={setMaxMSA}
                                                numSeeds={numSeeds}
                                                onNumSeedsChange={setNumSeeds}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <CheckBoxGroup
                                forceComputation={forceComputation}
                                makeResultsPublic={makeResultsPublic}
                                useDropout={useDropout}
                                onForceComputationChange={setForceComputation}
                                onMakeResultsPublicChange={setMakeResultsPublic}
                                onUseDropoutChange={setUseDropout}
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
