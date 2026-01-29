import React, { useState, useMemo } from "react";
import { ChevronDownIcon, ChevronUpIcon, CheckIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";

interface ProteinSequenceViewerProps {
    sequence: string | Record<string, string>;
    jobName?: string;
}

interface ParsedSequence {
    header: string;
    sequence: string;
    type?: MoleculeType;
}

type MoleculeType = "protein" | "rna" | "dna" | "ligand";

interface MoleculeCounts {
    protein: number;
    rna: number;
    dna: number;
    ligand: number;
}

const MAX_PREVIEW_LENGTH = 200;
const COPY_FEEDBACK_DURATION = 2000;

function parseJsonSequences(sequence: Record<string, string>): ParsedSequence[] {
    return Object.entries(sequence).map(([key, value]) => {
        const match = key.match(/^(protein|rna|dna|ligand)-(.+)$/);

        if (match) {
            const [, type, chainId] = match;
            return {
                header: chainId,
                sequence: value,
                type: type as MoleculeType,
            };
        }

        return {
            header: key,
            sequence: value,
        };
    });
}

function parseFastaSequences(sequence: string, jobName: string): ParsedSequence[] {
    const sequences: ParsedSequence[] = [];
    const lines = sequence.split("\n");
    let currentHeader = "";
    let currentSequence = "";
    let currentType: MoleculeType | undefined;

    lines.forEach((line) => {
        if (line.startsWith(">")) {
            if (currentHeader && currentSequence) {
                sequences.push({
                    header: currentHeader,
                    sequence: currentSequence.replace(/\s/g, ""),
                    type: currentType,
                });
            }

            const headerText = line.substring(1).trim() || `${jobName}_${sequences.length + 1}`;

            const headerMatch = headerText.match(/^([A-Z]+)\s*\|\s*(PROTEIN|RNA|DNA|LIGAND)$/i);
            if (headerMatch) {
                const [, chainId, type] = headerMatch;
                currentHeader = chainId;
                currentType = type.toLowerCase() as MoleculeType;
            } else {
                currentHeader = headerText;
                currentType = undefined;
            }

            currentSequence = "";
        } else {
            currentSequence += line.trim();
        }
    });

    if (currentHeader && currentSequence) {
        sequences.push({
            header: currentHeader,
            sequence: currentSequence.replace(/\s/g, ""),
            type: currentType,
        });
    }

    return sequences;
}

function parseSequences(sequence: string | Record<string, string>, jobName: string): ParsedSequence[] {
    if (typeof sequence === "object" && sequence !== null) {
        return parseJsonSequences(sequence);
    }

    if (typeof sequence === "string") {
        return sequence.startsWith(">") ? parseFastaSequences(sequence, jobName) : [{ header: jobName, sequence: sequence.replace(/\s/g, "") }];
    }

    return [];
}

function getSequenceSummary(sequences: ParsedSequence[], isComplex: boolean): string {
    if (sequences.length === 0) {
        return "No sequences";
    }
    if (!isComplex) {
        const seq = sequences[0];
        return seq.type === "ligand" ? seq.sequence : `${seq.sequence.length} characters`;
    }

    const counts: MoleculeCounts = {
        protein: 0,
        rna: 0,
        dna: 0,
        ligand: 0,
    };

    sequences.forEach((seq) => {
        if (seq.type && seq.type in counts) {
            counts[seq.type]++;
        }
    });

    const parts: string[] = [];
    if (counts.protein > 0) parts.push(`${counts.protein} protein${counts.protein > 1 ? "s" : ""}`);
    if (counts.rna > 0) parts.push(`${counts.rna} RNA`);
    if (counts.dna > 0) parts.push(`${counts.dna} DNA`);
    if (counts.ligand > 0) parts.push(`${counts.ligand} ligand${counts.ligand > 1 ? "s" : ""}`);

    return parts.join(", ");
}

function formatAsFasta(sequences: ParsedSequence[]): string {
    return sequences.map((seq) => `>${seq.header}\n${seq.sequence}`).join("\n");
}

export default function ProteinSequenceViewer({ sequence, jobName = "protein_sequence" }: ProteinSequenceViewerProps) {
    const [expandedSequences, setExpandedSequences] = useState<Set<number>>(new Set([0]));
    const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
    const [expandedFullSequences, setExpandedFullSequences] = useState<Set<number>>(new Set());

    const sequences = useMemo(() => parseSequences(sequence, jobName), [sequence, jobName]);
    const isComplex = sequences.length > 1;
    const summary = useMemo(() => getSequenceSummary(sequences, isComplex), [sequences, isComplex]);

    const showCopiedFeedback = (key: string) => {
        setCopiedStates((prev) => ({ ...prev, [key]: true }));
        setTimeout(() => {
            setCopiedStates((prev) => ({ ...prev, [key]: false }));
        }, COPY_FEEDBACK_DURATION);
    };

    const handleCopyAll = async () => {
        try {
            await navigator.clipboard.writeText(formatAsFasta(sequences));
            showCopiedFeedback("all");
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleCopySequence = async (seqIndex: number) => {
        try {
            await navigator.clipboard.writeText(sequences[seqIndex].sequence);
            showCopiedFeedback(`seq-${seqIndex}`);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const toggleSequence = (seqIndex: number) => {
        setExpandedSequences((prev) => {
            const newSet = new Set(prev);
            newSet.has(seqIndex) ? newSet.delete(seqIndex) : newSet.add(seqIndex);
            return newSet;
        });
    };

    const toggleFullSequence = (seqIndex: number) => {
        setExpandedFullSequences((prev) => {
            const newSet = new Set(prev);
            newSet.has(seqIndex) ? newSet.delete(seqIndex) : newSet.add(seqIndex);
            return newSet;
        });
    };

    return (
        <div className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 overflow-hidden">
            <div className="bg-gradient-to-br from-primary/5 via-secondary/10 to-primary/5 px-6 py-4 border-b border-gray-200/50">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-primary">
                            {isComplex ? "Input Sequences" : sequences[0]?.type?.toUpperCase() || "Sequence"}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 font-medium">{summary}</p>
                    </div>

                    <button
                        onClick={handleCopyAll}
                        className="btn btn-sm bg-white hover:bg-primary hover:text-white border-gray-300 shadow-sm transition-all duration-200"
                        aria-label="Copy all sequences">
                        {copiedStates["all"] ? (
                            <>
                                <CheckIcon className="w-4 h-4 text-success" />
                                <span className="ml-1.5 text-success font-semibold">Copied!</span>
                            </>
                        ) : (
                            <>
                                <DocumentDuplicateIcon className="w-4 h-4" />
                                <span className="ml-1.5 font-medium">Copy All</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-4 bg-gradient-to-br from-gray-50/50 to-white/50">
                {sequences.map((seq, seqIndex) => (
                    <SequenceItem
                        key={seqIndex}
                        sequence={seq}
                        isComplex={isComplex}
                        isExpanded={expandedSequences.has(seqIndex)}
                        isFullSequenceExpanded={expandedFullSequences.has(seqIndex)}
                        isCopied={copiedStates[`seq-${seqIndex}`]}
                        onToggle={() => toggleSequence(seqIndex)}
                        onToggleFullSequence={() => toggleFullSequence(seqIndex)}
                        onCopy={() => handleCopySequence(seqIndex)}
                    />
                ))}
            </div>
        </div>
    );
}

interface SequenceItemProps {
    sequence: ParsedSequence;
    isComplex: boolean;
    isExpanded: boolean;
    isFullSequenceExpanded: boolean;
    isCopied: boolean;
    onToggle: () => void;
    onToggleFullSequence: () => void;
    onCopy: () => void;
}

function SequenceItem({
    sequence,
    isComplex,
    isExpanded,
    isFullSequenceExpanded,
    isCopied,
    onToggle,
    onToggleFullSequence,
    onCopy,
}: SequenceItemProps) {
    const shouldTruncate = sequence.sequence.length > MAX_PREVIEW_LENGTH;
    const displaySequence =
        shouldTruncate && !isFullSequenceExpanded ? `${sequence.sequence.substring(0, MAX_PREVIEW_LENGTH)}...` : sequence.sequence;

    return (
        <div className="transition-all duration-200">
            {isComplex && (
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-3 flex-1">
                        <button
                            onClick={onToggle}
                            className="flex-shrink-0 text-gray-500 hover:text-primary hover:bg-primary/10 p-2 rounded-lg transition-all duration-200"
                            aria-label={isExpanded ? "Collapse sequence" : "Expand sequence"}
                            aria-expanded={isExpanded}>
                            {isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                        </button>
                        <div className="flex items-center gap-3 flex-wrap">
                            {sequence.type ? (
                                <>
                                    <h4 className="text-base font-bold text-gray-900">{sequence.type.toUpperCase()}</h4>
                                    {sequence.header.includes("-") ? sequence.header.split("-").map((part, idx) => (
                                        <span key={idx} className="badge badge-lg bg-primary/10 text-primary border-primary/20 font-semibold">
                                            {part.length > 10 ? part.substring(0, 10) + "..." : part}
                                        </span>
                                    )) : (
                                        <span className="badge badge-lg bg-primary/10 text-primary border-primary/20 font-semibold">
                                            {sequence.header.length > 10 ? sequence.header.substring(0, 10) + "..." : sequence.header}
                                        </span>
                                    )}
                                </>
                            ) : (
                                <h4 className="text-base font-bold text-gray-900">{sequence.header}</h4>
                            )}
                            {sequence.type !== "ligand" && (
                                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                    {sequence.sequence.length} characters
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onCopy}
                        className="flex-shrink-0 btn btn-xs bg-white hover:bg-primary hover:text-white border-gray-300 shadow-sm transition-all duration-200"
                        aria-label={`Copy ${sequence.header} sequence`}>
                        {isCopied ? (
                            <span className="flex items-center gap-1.5 text-success font-semibold">
                                <CheckIcon className="w-3.5 h-3.5" />
                                Copied!
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 font-medium">
                                <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                                Copy
                            </span>
                        )}
                    </button>
                </div>
            )}

            {(isExpanded || !isComplex) && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                    <div className="p-5">
                        <div className="font-mono text-sm text-gray-800 break-all leading-relaxed whitespace-pre-wrap">{displaySequence}</div>
                        {shouldTruncate && (
                            <button
                                onClick={onToggleFullSequence}
                                className="mt-3 text-sm text-primary hover:text-primary/80 font-semibold hover:underline transition-all duration-200 flex items-center gap-1"
                                aria-label={isFullSequenceExpanded ? "Show less of sequence" : "Show full sequence"}>
                                {isFullSequenceExpanded ? (
                                    <>
                                        <ChevronUpIcon className="w-4 h-4" />
                                        Show less
                                    </>
                                ) : (
                                    <>
                                        <ChevronDownIcon className="w-4 h-4" />
                                        Show {sequence.sequence.length - MAX_PREVIEW_LENGTH} more characters
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
