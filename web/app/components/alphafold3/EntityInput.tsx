import { ChangeEvent } from "react";
import { Hint } from "@/app/components/Hint";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Sequence {
    type: "protein" | "rna" | "dna" | "ligand" | "ligand-ccd" | "ligand-smiles";
    copies: string;
    input: string;
}

interface SequenceInputProps {
    sequence: Sequence;
    index: number;
    onChange: (index: number, field: keyof Sequence, value: string) => void;
    onRemove: (index: number) => void;
    disabled: boolean;
    errors: Record<string, string>;
}

export const SequenceInput = ({ sequence, index, onChange, onRemove, disabled, errors }: SequenceInputProps) => {
    const type = "ccdCodes" in sequence ? "ligand" : sequence.type;

    const getTypeDisplayName = (type: string) => {
        switch (type) {
            case "protein":
                return "Protein";
            case "rna":
                return "RNA";
            case "dna":
                return "DNA";
            case "ligand":
                return "Ligand (CCD)";
            case "ligand-ccd":
                return "Ligand (Custom CCD)";
            case "ligand-smiles":
                return "Ligand (SMILES)";
            default:
                return type;
        }
    };

    const getInputPlaceholder = (type: string) => {
        switch (type) {
            case "protein":
                return "Enter protein sequence...";
            case "rna":
                return "Enter RNA sequence...";
            case "dna":
                return "Enter DNA sequence...";
            case "ligand-ccd":
                return "Enter CCD code (e.g., LIG-1337)";
            case "ligand-smiles":
                return "Enter SMILES string (e.g., CC(=O)OC1C[NH+]2CCC1CC2)";
            default:
                return "Enter sequence...";
        }
    };

    return (
        <div className="relative bg-white/80 border-1 border-base-300 rounded-4xl p-4 shadow-sm transition-all duration-200 hover:shadow-md">
            {/* Compact Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center">
                        <span className="text-primary font-bold">{index + 1}</span>
                    </div>
                    <h3 className="font-medium text-base-content">Entity {index + 1}</h3>
                    <span className=" text-base-content/50">•</span>
                    <span className="text-base-content/60">{getTypeDisplayName(sequence.type)}</span>
                </div>

                {!disabled && (
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="btn btn-ghost text-error hover:bg-error/10 rounded-md"
                        title="Remove entity">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* 3-Column Compact Layout */}
            <div className="grid grid-cols-12 gap-3 items-start">
                {/* Entity Type - 2 columns */}
                <div className="col-span-10 sm:col-span-2">
                    <fieldset className="fieldset w-full">
                        <legend className="flex flex-row gap-1 ml-1 items-center mb-1">
                            <span className="fieldset-legend">Type *</span>
                            <Hint hint="Select the type of molecular entity you want to predict." />
                        </legend>
                        <select
                            id={`type-${index}`}
                            className="select select-bordered select-md w-full bg-white"
                            value={sequence.type}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(index, "type", e.target.value)}>
                            <option value="protein">Protein</option>
                            <option value="rna">RNA</option>
                            <option value="dna">DNA</option>
                            <option value="ligand">Ligand (CCD)</option>
                            <option value="ligand-ccd">Custom CCD</option>
                            <option value="ligand-smiles">SMILES</option>
                        </select>
                    </fieldset>
                </div>

                {/* Copy IDs - 2 columns */}
                <div className="col-span-14 sm:col-span-2">
                    <fieldset className="fieldset w-full">
                        <legend className="flex flex-row gap-1 ml-1 items-center mb-1">
                            <span className="fieldset-legend">IDs *</span>
                            <Hint hint="Unique uppercase letter(s) for each copy. Example: A,B,C for three copies." />
                        </legend>
                        <input
                            type="text"
                            id={`copies-${index}`}
                            placeholder="A,B,C"
                            className={`input input-md w-full bg-white ${errors[`copies-${index}`] ? "input-error" : "input-border"}`}
                            value={sequence.copies}
                            onChange={(e) => onChange(index, "copies", e.target.value)}
                        />
                        {errors[`copies-${index}`] && <p className="text-error text-xs mt-1">{errors[`copies-${index}`]}</p>}
                    </fieldset>
                </div>

                {/* Sequence/Input Field - 8 columns */}
                <div className="col-span-12 sm:col-span-8">
                    <fieldset className="fieldset w-full">
                        <legend className="flex flex-row gap-1 ml-1 items-center mb-1">
                            <span className="fieldset-legend">
                                {type === "ligand-ccd"
                                    ? "CCD Code *"
                                    : type === "ligand-smiles"
                                    ? "SMILES String *"
                                    : type === "ligand"
                                    ? "Ligand Selection *"
                                    : "Sequence *"}
                            </span>
                            {type === "ligand-ccd" && (
                                <a
                                    className="ml-4 hover:text-secondary-focus hover:underline"
                                    href="https://www.ebi.ac.uk/pdbe-srv/pdbechem/"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    Look Up CCD Codes🔍
                                </a>
                            )}
                        </legend>

                        {type === "ligand" ? (
                            <select
                                id={`input-${index}`}
                                value={sequence.input}
                                onChange={(e) => onChange(index, "input", e.target.value)}
                                className={`select select-bordered select-md w-full bg-white ${
                                    errors[`input-${index}`] ? "select-error" : ""
                                }`}>
                                <option value="">Select a ligand</option>
                                <option value="ADP">ADP - Adenosine diphosphate</option>
                                <option value="ATP">ATP - Adenosine triphosphate</option>
                                <option value="AMP">AMP - Adenosine phosphate</option>
                                <option value="GDP">GDP - Guanosine-5`&apos;`-diphosphate</option>
                                <option value="GTP">GTP - Guanosine-5`&apos;`-triphosphate</option>
                                <option value="FAD">FAD - Flavin-adenine dinucleotide</option>
                                <option value="NAD">NAD - Nicotinamide-adenine dinucleotide</option>
                                <option value="NAP">NAP - NADP</option>
                                <option value="NDP">NDP - NADPH</option>
                                <option value="HEM">HEM - Heme</option>
                                <option value="PLM">PLM - Palmitic acid</option>
                                <option value="OLA">OLA - Oleic acid</option>
                                <option value="MYR">MYR - Myristic acid</option>
                                <option value="CIT">CIT - Citric acid</option>
                                <option value="CLA">CLA - Chlorophyll A</option>
                                <option value="CHL">CHL - Chlorophyll B</option>
                                <option value="BCL">BCL - Bacteriochlorophyll A</option>
                                <option value="BCB">BCB - Bacteriochlorophyll B</option>
                            </select>
                        ) : type === "ligand-ccd" || type === "ligand-smiles" ? (
                            <input
                                type="text"
                                id={`input-${index}`}
                                placeholder={getInputPlaceholder(type)}
                                className={`input input-md w-full bg-white ${errors[`input-${index}`] ? "input-error" : "input-border"}`}
                                value={sequence.input}
                                onChange={(e) => onChange(index, "input", e.target.value)}
                            />
                        ) : (
                            <textarea
                                id={`input-${index}`}
                                placeholder={getInputPlaceholder(type)}
                                value={sequence.input}
                                onChange={(e) => onChange(index, "input", e.target.value)}
                                className={`textarea textarea-bordered textarea-md w-full p-4 bg-white leading-tight ${
                                    errors[`input-${index}`] ? "textarea-error" : ""
                                }`}
                                rows={2}
                            />
                        )}

                        {errors[`input-${index}`] && <p className="text-error text-xs mt-1">{errors[`input-${index}`]}</p>}
                    </fieldset>
                </div>
            </div>

            {/* Compact Helper Text */}
            <div className="mt-3 p-2 bg-base-100/30 border border-base-300/50 rounded-md">
                <p className="text-xs text-base-content/60 leading-tight">
                    {type === "ligand" && "Select from common ligands."}
                    {type === "ligand-ccd" && "Enter custom CCD code."}
                    {type === "ligand-smiles" && "Enter SMILES string."}
                    {(type === "protein" || type === "rna" || type === "dna") &&
                        `${type.charAt(0).toUpperCase() + type.slice(1)} sequence (no FASTA header).`}
                    {" Copy IDs must be unique."}
                </p>
            </div>
        </div>
    );
};
