export interface Protein {
    id: string | string[];
    sequence: string;
}

export interface RNA {
    id: string | string[];
    sequence: string;
}

export interface DNA {
    id: string | string[];
    sequence: string;
}

export interface Ligand {
    id: string | string[];
    ccdCodes?: string[];
    smiles?: string;
}
export type Bond = [string, number, string]; // [id, residue, atom]

export type BondedAtomPair = [Bond, Bond];

export interface Job {
    name: string;
    modelSeeds: number[];
    sequences: Array<{ protein: Protein } | { rna: RNA } | { dna: DNA } | { ligand: Ligand }>;
    bondedAtomPairs?: [string, number, string][][]; // Optional
    userCCD?: string; // Optional
    userCCDPath?: string; // Optional
    dialect: "alphafold3"; // Required
    version: number; // Required
    public: boolean;
    email: string;
    largeInput: boolean;
    forceComputation: boolean;
    precomputedMSA?: boolean; // Optional
    precomputedTemplates?: boolean; // Optional
    numberOfTemplates?: number; // Optional
}
