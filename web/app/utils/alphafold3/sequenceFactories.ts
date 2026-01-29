import { Protein, RNA, DNA, Ligand, Job } from "@/app/types/alphafold3Types";

export const createProtein = (id: string | string[], sequence: string): { protein: Protein } => ({
    protein: { id, sequence },
});

export const createRNA = (id: string | string[], sequence: string): { rna: RNA } => ({
    rna: { id, sequence },
});

export const createDNA = (id: string | string[], sequence: string): { dna: DNA } => ({
    dna: { id, sequence },
});

export const createLigand = (id: string | string[], ccdCodes?: string[], smiles?: string): { ligand: Ligand } =>
    ccdCodes ? { ligand: { id, ccdCodes } } : smiles ? { ligand: { id, smiles } } : { ligand: { id } };

// Main job creation function
export const createJob = (
    name: string,
    modelSeeds: number[],
    sequences: Array<{ protein: Protein } | { rna: RNA } | { dna: DNA } | { ligand: Ligand }>,
    email: string,
    options: {
        public?: boolean;
        largeInput?: boolean;
        forceComputation?: boolean;
        bondedAtomPairs?: [string, number, string][][];
        userCCD?: string;
        userCCDPath?: string;
        precomputedMSA?: boolean;
        precomputedTemplates?: boolean;
        numberOfTemplates?: number;
    } = {}
): Job => ({
    name,
    modelSeeds,
    sequences,
    dialect: "alphafold3",
    version: options.userCCDPath ? 3 : 1,
    email,
    public: options.public || false,
    largeInput: options.largeInput || false,
    forceComputation: options.forceComputation || false,
    bondedAtomPairs: options.bondedAtomPairs,
    ...(options.userCCD && { userCCD: options.userCCD }),
    ...(options.userCCDPath && { userCCDPath: options.userCCDPath }),
    precomputedMSA: options.precomputedMSA || false,
    ...(options.precomputedTemplates && { precomputedTemplates: options.precomputedTemplates || false }),
    ...(options.precomputedTemplates && { numberOfTemplates: options.numberOfTemplates || 20 }),
});
