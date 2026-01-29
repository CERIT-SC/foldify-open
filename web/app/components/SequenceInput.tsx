import { Hint } from "@/app/components/Hint";
import ReactMarkdown from "react-markdown";
import { useState } from "react";

interface SequenceInputProps {
    sequence: string;
    placeholder: string;
    onChange: (value: string) => void;
    errors: Record<string, string>;
    warnings?: Record<string, string>;
    info?: string;
    jobName?: string;
    isMultiFold?: boolean; // New prop to identify MultiFold usage
}

const preprocessHint = (hint: string) => {
    if (hint.includes("~newline")) {
        return hint.split("~newline");
    }
    return [hint];
};

const formatToFasta = (sequence: string, jobName: string) => {
    const cleanSequence = sequence
        .split("\n")
        .filter((line) => !line.startsWith(">"))
        .join("")
        .replace(/\s/g, "")
        .toUpperCase();

    if (!cleanSequence) return "";

    const randomNum = Math.floor(Math.random() * 1000);
    return `>${jobName}-${randomNum}\n${cleanSequence}`;
};

const extractAminoSequence = (sequence: string) => {
    return sequence
        .split("\n")
        .filter((line) => !line.startsWith(">"))
        .join("")
        .replace(/\s/g, "");
};

export default function SequenceInput({
    sequence,
    placeholder,
    onChange,
    errors,
    warnings,
    info,
    jobName = "sequence",
    isMultiFold = false,
}: SequenceInputProps) {
    const [inputMode, setInputMode] = useState<"amino" | "fasta">("amino");
    const formattedInfo = preprocessHint(info || "");

    const handleModeChange = (newMode: "amino" | "fasta") => {
        if (newMode === inputMode) return;

        setInputMode(newMode);

        if (newMode === "fasta" && sequence && !sequence.startsWith(">")) {
            const fastaFormatted = formatToFasta(sequence, jobName);
            onChange(fastaFormatted);
        } else if (newMode === "amino" && sequence.startsWith(">")) {
            const aminoSequence = extractAminoSequence(sequence);
            onChange(aminoSequence);
        }
    };

    const handleInputChange = (value: string) => {
        if (isMultiFold) {
            // For MultiFold, always store as amino acid sequence
            if (value.startsWith(">")) {
                // If user pastes FASTA format, extract just the amino acid sequence
                const aminoSequence = extractAminoSequence(value);
                onChange(aminoSequence);
            } else {
                onChange(value);
            }
        } else {
            // For other tools, use the normal behavior
            onChange(value);
        }
    };

    const getPlaceholder = () => {
        if (inputMode === "amino") {
            return "MDSSSETSPAAPLRTIPGSYGIPFLQPIKDRLEYFYGKGGRDEYFHSRLQ";
        }
        return placeholder;
    };

    const getDisplayValue = () => {
        if (inputMode === "amino" && sequence.startsWith(">")) {
            return extractAminoSequence(sequence);
        }
        return sequence;
    };

    return (
        <fieldset className="fieldset w-full">
            {/* Mode Toggle - Hide for MultiFold since it only accepts amino acid sequences */}
            {!isMultiFold && (
                <div className="mb-4">
                    <div className="tabs tabs-boxed p-1 w-fit rounded-3xl shadow-lg">
                        <button
                            type="button"
                            className={`tab ${inputMode === "amino" ? "tab-active font-bold" : ""}`}
                            onClick={() => handleModeChange("amino")}>
                            Amino Acid Sequence
                        </button>
                        <button
                            type="button"
                            className={`tab ${inputMode === "fasta" ? "tab-active font-bold" : ""}`}
                            onClick={() => handleModeChange("fasta")}>
                            FASTA Format
                        </button>
                    </div>
                </div>
            )}

            <textarea
                className={`textarea h-36 w-full p-4 bg-white ${errors.proteinSequence ? "input-error" : "input-border"}`}
                placeholder={getPlaceholder()}
                value={getDisplayValue()}
                rows={5}
                onChange={(e) => handleInputChange(e.target.value)}
            />

            <div className="label">
                {errors.proteinSequence && <p className="text-error text-xs mt-1 text-wrap">{errors.proteinSequence}</p>}
                {warnings?.proteinSequence && <p className="text-plddt-orange text-xs mt-1 text-wrap">{warnings?.proteinSequence}</p>}
            </div>

            {/* Information */}
            {info && (
                <div className=" p-3 bg-white/80 border border-base-200 rounded-3xl">
                    <div className="text-xs text-base-content space-y-1">
                        {formattedInfo.map((line, index) => (
                            <div
                                key={index}
                                className="prose prose-sm prose-slate max-w-none">
                                <ReactMarkdown>{line}</ReactMarkdown>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </fieldset>
    );
}
