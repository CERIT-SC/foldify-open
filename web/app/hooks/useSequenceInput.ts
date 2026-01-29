import { useState } from "react";

interface Sequence {
    type: "protein" | "rna" | "dna" | "ligand" | "ligand-smiles" | "ligand-ccd";
    copies: string;
    input: string;
}

export const useSequenceInput = (initialSequences: Sequence[]) => {
    const [sequences, setSequences] = useState<Sequence[]>(initialSequences);

    const addSequence = () => {
        setSequences([...sequences, { type: "protein", copies: "", input: "" }]);
    };

    const removeSequence = (index: number) => {
        setSequences(sequences.filter((_, i) => i !== index));
    };

    const handleSequenceChange = (index: number, field: keyof Sequence, value: string) => {
        setSequences((prevSequences) => prevSequences.map((sequence, i) => (i === index ? { ...sequence, [field]: value } : sequence)));
    };

    return { sequences, addSequence, removeSequence, handleSequenceChange };
};
