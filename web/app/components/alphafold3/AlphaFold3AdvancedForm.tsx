"use client";

import { useState, useEffect } from "react";

import { generateSlug } from "random-word-slugs";
import { JobNameInput } from "@/app/components/JobNameInput";
import { ModelSeedsInput } from "./ModelSeedsInput";

import { SequenceInput } from "./EntityInput";
import { useSequenceInput } from "@/app/hooks/useSequenceInput";
import { AddSequenceButton } from "./AddSequenceButton";
import { CheckBoxGroup } from "./AF3CheckBoxGroup";
import { useFormValidation } from "@/app/hooks/useFormValidation";
import { useJobSubmission } from "@/app/hooks/alphafold3/useJobSubmission";
import AlertSuccess from "@/app/components/SuccessAlertWindow";
import AlertError from "@/app/components/ErrorAlertWindow";
import { BondedAtomPairsInput } from "./BondedAtomPairsInput";
import { useBondInput } from "@/app/hooks/alphafold3/useBondInput";
import { useUserCCDValidation } from "@/app/hooks/alphafold3/useUserCCDValidation";
import WarningAlert from "@/app/components/WarningAlert";
import MMSeqs2Group from "@/app/components/alphafold3/MMSeqs2Group";
import { ChevronDoubleRightIcon } from "@heroicons/react/24/outline";

import { createProtein, createRNA, createDNA, createLigand, createJob } from "@/app/utils/alphafold3/sequenceFactories";
import CCDFileUpload from "./CCDFileUpload";
import EmailInput from "@/app/components/EmailInput";

export default function AlphaFold3AdvancedForm() {
    const { sequences, addSequence, removeSequence, handleSequenceChange } = useSequenceInput([
        {
            type: "protein",
            copies: "",
            input: "",
        },
    ]);

    const [jobName, setJobName] = useState(generateSlug(2));
    const [email, setEmail] = useState<string>("");
    const [modelSeeds, setModelSeeds] = useState<string>("1");
    const [makeResultsPublic, setMakeResultsPublic] = useState<boolean>(false);
    const [forceComputation, setForceComputation] = useState<boolean>(false);
    const [largeInput, setLargeInput] = useState<boolean>(false);
    const [precomputedMSA, setPrecomputedMSA] = useState<boolean>(true);
    const [precomputedTemplates, setPrecomputedTemplates] = useState<boolean>(false);
    const [numberOfTemplates, setNumberOfTemplates] = useState<number>(20);

    const { bonds, addBond, removeBond, handleBondChange } = useBondInput([
        [
            { id: "", residue: 1, atom: "" },
            { id: "", residue: 1, atom: "" },
        ],
    ]);
    const [userCCDFile, setUserCCDFile] = useState<File | null>(null);
    const { errorsCCD, isFileValid } = useUserCCDValidation(userCCDFile);

    const { errors, isFormValid, warnings } = useFormValidation(jobName, modelSeeds, sequences, email);

    const { isLoading, submitSuccessMessage, submitErrorMessage, submitJob } = useJobSubmission();

    const handleSubmit = () => {
        if (isFormValid && isFileValid) {
            const formattedBonds = bonds.map(
                (pair) =>
                    [
                        [pair[0].id, pair[0].residue, pair[0].atom],
                        [pair[1].id, pair[1].residue, pair[1].atom],
                    ] as [string, number, string][],
            );

            const shouldSkipBonds = formattedBonds.every((pair) => pair.every(([id, residue, atom]) => id === "" || atom === ""));

            const formattedSequences = sequences.map((seq) => {
                switch (seq.type) {
                    case "protein":
                        return createProtein(seq.copies.split(","), seq.input);
                    case "rna":
                        return createRNA(seq.copies.split(","), seq.input);
                    case "dna":
                        return createDNA(seq.copies.split(","), seq.input);
                    case "ligand":
                        return createLigand(seq.copies.split(","), seq.input.split(","));
                    case "ligand-ccd":
                        return createLigand(seq.copies.split(","), seq.input.split(","));
                    case "ligand-smiles":
                        return createLigand(seq.copies.split(","), undefined, seq.input);
                    default:
                        throw new Error("Invalid sequence type: ${seq.type}");
                }
            });

            let userCCDPath = "";
            if (userCCDFile) {
                userCCDPath = userCCDFile.name;
            }

            const jobData = createJob(
                jobName,
                modelSeeds.split(",").map((seed) => parseInt(seed)),
                formattedSequences,
                email,
                {
                    ...(!shouldSkipBonds && { bondedAtomPairs: formattedBonds }),
                    public: makeResultsPublic,
                    largeInput: largeInput,
                    forceComputation: forceComputation,
                    userCCDPath: userCCDPath,
                    precomputedMSA: precomputedMSA,
                    ...(precomputedTemplates && { precomputedTemplates: precomputedTemplates }),
                    ...(precomputedTemplates && { numberOfTemplates: precomputedTemplates ? numberOfTemplates : 20 }),
                },
            );
            submitJob(jobData, userCCDFile ? userCCDFile : undefined);
        } else {
            console.log("Form or File is invalid");
        }
    };

    useEffect(() => {
        if (submitErrorMessage) {
            const errorModal = document?.getElementById("advanced_error_modal") as HTMLDialogElement;
            errorModal.showModal();
        }

        if (submitSuccessMessage) {
            const successModal = document?.getElementById("advanced_success_modal") as HTMLDialogElement;
            successModal.showModal();
        }
    }, [submitSuccessMessage, submitErrorMessage]);

    return (
        <div className="space-y-8">
            {/* Basic Information Section */}
            <section>
                <h2 className="text-xl font-semibold text-base-content mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">1</span>
                    </div>
                    Basic Information
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
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
                    <ModelSeedsInput
                        modelSeeds={modelSeeds}
                        onChange={setModelSeeds}
                        error={errors.modelSeeds}
                    />
                </div>
            </section>

            {/* Sequences Section */}
            <section>
                <h2 className="text-xl font-semibold text-base-content mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">2</span>
                    </div>
                    Sequences and Ligands
                </h2>
                <div className="space-y-4">
                    {warnings &&
                        Object.keys(warnings).length > 0 &&
                        Object.entries(warnings).map(([key, message]) => (
                            <WarningAlert
                                key={key}
                                message={message}
                            />
                        ))}
                    {sequences.map((sequence, index) => (
                        <SequenceInput
                            key={index}
                            sequence={sequence}
                            index={index}
                            onChange={handleSequenceChange}
                            onRemove={removeSequence}
                            disabled={sequences.length === 1}
                            errors={errors}
                        />
                    ))}
                    <AddSequenceButton onClick={addSequence} />
                </div>
            </section>

            {/* Model Configuration Accordion */}
            <section>
                <div className="collapse collapse-arrow bg-base-100/10 border border-base-300">
                    <input
                        type="checkbox"
                        defaultChecked
                    />
                    <div className="collapse-title text-xl font-semibold text-base-content flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                            <span className="text-primary font-bold text-sm">3</span>
                        </div>
                        Model Configuration
                    </div>
                    <div className="collapse-content">
                        <div className="pt-4">
                            <MMSeqs2Group
                                precomputedMSA={precomputedMSA}
                                precomputedTemplates={precomputedTemplates}
                                numberOfTemplates={numberOfTemplates}
                                onPrecomputedMSAChange={setPrecomputedMSA}
                                onPrecomputedTemplatesChange={setPrecomputedTemplates}
                                onNumberOfTemplatesChange={setNumberOfTemplates}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Advanced Parameters Accordion */}
            <section>
                <div className="collapse collapse-arrow bg-base-100/10 border border-base-300">
                    <input type="checkbox" />
                    <div className="collapse-title text-xl font-semibold text-base-content flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                            <span className="text-primary font-bold text-sm">4</span>
                        </div>
                        Advanced Parameters
                    </div>
                    <div className="collapse-content">
                        <div className="pt-4 space-y-6">
                            {/* Bonded Atom Pairs */}
                            <div>
                                <h3 className="text-lg font-medium text-base-content mb-4">Bonded Atom Pairs</h3>
                                <div className="space-y-4">
                                    {bonds.map((bond, index) => (
                                        <BondedAtomPairsInput
                                            key={index}
                                            bondedAtomPairs={bond}
                                            index={index}
                                            onChange={handleBondChange}
                                            onRemove={removeBond}
                                            disabled={bonds.length === 1}
                                            errors={errors}
                                        />
                                    ))}
                                    <AddSequenceButton
                                        onClick={addBond}
                                        sequenceEntity={false}
                                    />
                                </div>
                            </div>

                            {/* User CCD File */}

                            <CCDFileUpload
                                userCCDFile={userCCDFile}
                                setUserCCDFile={setUserCCDFile}
                                errorsCCD={errorsCCD}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <CheckBoxGroup
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
                            isFormValid && !isLoading && isFileValid ? "btn-primary hover:shadow-xl transform hover:-translate-y-0.5" : "btn-disabled"
                        }`}
                        disabled={!isFormValid || isLoading || !isFileValid}
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
                    <p className="text-sm text-base-content/60 mt-4">You will receive an email notification when your job completes</p>
                </div>
            </div>

            <span className="text-xs text-base-content/60">* Required fields.</span>

            {/* Display success/error messages */}
            <AlertError
                id={"advanced_error_modal"}
                errorAlertMessage={submitErrorMessage}
            />
            <AlertSuccess
                id={"advanced_success_modal"}
                successAlertMessage={submitSuccessMessage}
                additionalInfo="You will receive an e-mail notification when the computation finishes."
            />
        </div>
    );
}
