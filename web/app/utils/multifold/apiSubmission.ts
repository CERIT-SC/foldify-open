import axios from "axios";

export interface MultiFoldConfig {
    jobName: string;
    sequence: string;
    email: string;
    makeResultsPublic: boolean;
    forceComputation: boolean;
}

export interface ToolConfig {
    alphafold3: {
        modelSeeds: number[];
        dialect: string;
        version: number;
        largeInput: boolean;
        precomputedMSA: boolean;
    };
    alphafold2: {
        maxTemplateDate?: string;
        predictionsPerModel: string;
        dbPreset: string;
        modelPreset: string;
        version: string;
        runRelax: boolean;
        reuseMSAs: boolean;
    };
    colabfold: {
        templateMode: string;
        numRelax: string;
        msaMode: string;
        pairMode: string;
        modelPreset: string;
        numModels: string;
        numRecycles: string;
        recycleTolerance: string;
        maxMSA: string;
        numSeeds: string;
        version: string;
        useDropout: boolean;
    };
    esmfold: {
        numRecycles: string;
        numCopies: string;
    };
    omegafold: {
        numCycle: string;
        numPseudoMSAs: string;
        pseudoMSAMask: string;
    };
}

export interface SubmissionResult {
    tool: string;
    success: boolean;
    message?: string;
    error?: string;
}

const formatSequenceForTool = (sequence: string, jobName: string): string => {
    // Convert amino acid sequence to FASTA format if needed
    if (!sequence.startsWith(">")) {
        const cleanSequence = sequence.replace(/\s/g, "").toUpperCase();
        const randomNum = Math.floor(Math.random() * 1000);
        return `>${jobName}-${randomNum}\n${cleanSequence}`;
    }
    return sequence;
};

const submitAlphaFold2 = async (config: MultiFoldConfig, toolConfig: ToolConfig["alphafold2"]): Promise<SubmissionResult> => {
    try {
        const finalSequence = formatSequenceForTool(config.sequence, config.jobName);

        const response = await axios.post(
            "/api/flask/alphafold/submit",
            {
                jobName: config.jobName + "-AF2",
                proteinSequence: finalSequence,
                maxTemplateDate: toolConfig.maxTemplateDate || null,
                predictionsPerModel: toolConfig.predictionsPerModel,
                dbPreset: toolConfig.dbPreset,
                modelPreset: toolConfig.modelPreset,
                email: config.email,
                version: toolConfig.version,
                forceComputation: config.forceComputation,
                runRelax: toolConfig.runRelax,
                reuseMSAs: toolConfig.reuseMSAs,
                makeResultsPublic: config.makeResultsPublic,
            }
        );

        return {
            tool: "AlphaFold2",
            success: true,
            message: response.data.message,
        };
    } catch (error: any) {
        return {
            tool: "AlphaFold2",
            success: false,
            error: error.response?.data?.error || error.message,
        };
    }
};

const submitAlphaFold3 = async (config: MultiFoldConfig, toolConfig: ToolConfig["alphafold3"]): Promise<SubmissionResult> => {
    let formData = new FormData();
    formData.append(
        "data",
        JSON.stringify({
            name: config.jobName + "-AF3",
            sequences: [
                {
                    protein: {
                        id: ["A"],
                        sequence: config.sequence,
                    },
                },
            ],
            modelSeeds: toolConfig.modelSeeds,
            dialect: toolConfig.dialect,
            version: toolConfig.version,
            largeInput: toolConfig.largeInput,
            precomputedMSA: toolConfig.precomputedMSA,
            email: config.email,
            forceComputation: config.forceComputation,
            public: config.makeResultsPublic,
        })
    );

    console.log("Submitting to AlphaFold3 from Multifold with data:", formData);
    try {
        const response = await axios.post("/api/flask/alphafold3/v1/submit", formData);
        return {
            tool: "AlphaFold3",
            success: true,
            message: response.data.message,
        };
    } catch (error: any) {
        return {
            tool: "AlphaFold3",
            success: false,
            error: error.response?.data?.error || error.message,
        };
    }
};

const submitColabFold = async (config: MultiFoldConfig, toolConfig: ToolConfig["colabfold"]): Promise<SubmissionResult> => {
    try {
        const finalSequence = formatSequenceForTool(config.sequence, config.jobName);

        const response = await axios.post(
            "/api/flask/colabfold/submit",
            {
                jobName: config.jobName + "-CBF",
                proteinSequence: finalSequence,
                templateMode: toolConfig.templateMode,
                numRelax: toolConfig.numRelax,
                msaMode: toolConfig.msaMode,
                pairMode: toolConfig.pairMode,
                modelPreset: toolConfig.modelPreset,
                numModels: toolConfig.numModels,
                numRecycles: toolConfig.numRecycles,
                recycleTolerance: toolConfig.recycleTolerance,
                maxMSA: toolConfig.maxMSA,
                numSeeds: toolConfig.numSeeds,
                email: config.email,
                version: toolConfig.version,
                forceComputation: config.forceComputation,
                makeResultsPublic: config.makeResultsPublic,
                useDropout: toolConfig.useDropout,
            }
        );

        return {
            tool: "ColabFold",
            success: true,
            message: response.data.message,
        };
    } catch (error: any) {
        return {
            tool: "ColabFold",
            success: false,
            error: error.response?.data?.error || error.message,
        };
    }
};

const submitESMFold = async (config: MultiFoldConfig, toolConfig: ToolConfig["esmfold"]): Promise<SubmissionResult> => {
    try {
        const finalSequence = formatSequenceForTool(config.sequence, config.jobName);

        const response = await axios.post(
            "/api/flask/esmfold/submit",
            {
                jobName: config.jobName + "-EMF",
                proteinSequence: finalSequence,
                numCopies: toolConfig.numCopies,
                numRecycles: toolConfig.numRecycles,
                email: config.email,
                makeResultsPublic: config.makeResultsPublic,
                forceComputation: config.forceComputation,
            }
        );

        return {
            tool: "ESMFold",
            success: true,
            message: response.data.message,
        };
    } catch (error: any) {
        return {
            tool: "ESMFold",
            success: false,
            error: error.response?.data?.error || error.message,
        };
    }
};

const submitOmegaFold = async (config: MultiFoldConfig, toolConfig: ToolConfig["omegafold"]): Promise<SubmissionResult> => {
    try {
        const finalSequence = formatSequenceForTool(config.sequence, config.jobName);

        const response = await axios.post(
            "/api/flask/omegafold/submit",
            {
                jobName: config.jobName + "-OMF",
                proteinSequence: finalSequence,
                numCycle: toolConfig.numCycle,
                numPseudoMSAs: toolConfig.numPseudoMSAs,
                pseudoMSAMask: toolConfig.pseudoMSAMask,
                email: config.email,
                makeResultsPublic: config.makeResultsPublic,
                forceComputation: config.forceComputation,
            },
        );

        return {
            tool: "OmegaFold",
            success: true,
            message: response.data.message,
        };
    } catch (error: any) {
        return {
            tool: "OmegaFold",
            success: false,
            error: error.response?.data?.error || error.message,
        };
    }
};

export const submitMultiFoldJobs = async (
    selectedTools: string[],
    config: MultiFoldConfig,
    toolConfigs: ToolConfig
): Promise<SubmissionResult[]> => {
    const results: SubmissionResult[] = [];
    const submissionPromises: Promise<SubmissionResult>[] = [];

    for (const tool of selectedTools) {
        switch (tool.toLowerCase()) {
            case "alphafold3":
                submissionPromises.push(submitAlphaFold3(config, toolConfigs.alphafold3));
                break;
            case "alphafold2":
                submissionPromises.push(submitAlphaFold2(config, toolConfigs.alphafold2));
                break;
            case "colabfold":
                submissionPromises.push(submitColabFold(config, toolConfigs.colabfold));
                break;
            case "esmfold":
                submissionPromises.push(submitESMFold(config, toolConfigs.esmfold));
                break;
            case "omegafold":
                submissionPromises.push(submitOmegaFold(config, toolConfigs.omegafold));
                break;
            default:
                results.push({
                    tool: tool,
                    success: false,
                    error: `Unknown tool: ${tool}`,
                });
        }
    }

    // Wait for all submissions to complete
    const submissionResults = await Promise.allSettled(submissionPromises);

    submissionResults.forEach((result) => {
        if (result.status === "fulfilled") {
            results.push(result.value);
        } else {
            results.push({
                tool: "Unknown",
                success: false,
                error: `Submission failed: ${result.reason}`,
            });
        }
    });

    return results;
};

// Default configurations - you can modify these as needed
export const getDefaultToolConfigs = (): ToolConfig => ({
    alphafold3: {
        modelSeeds: [1],
        dialect: "alphafold3",
        version: 1,
        precomputedMSA: true,
        largeInput: false,
    },
    alphafold2: {
        maxTemplateDate: "",
        predictionsPerModel: "5",
        dbPreset: "full_dbs",
        modelPreset: "monomer",
        version: "Alphafold 2.3.1",
        runRelax: true,
        reuseMSAs: false,
    },
    colabfold: {
        templateMode: "none",
        numRelax: "0",
        msaMode: "mmseqs2_uniref_env",
        pairMode: "unpaired_paired",
        modelPreset: "alphafold2_ptm",
        numModels: "5",
        numRecycles: "3",
        recycleTolerance: "auto",
        maxMSA: "auto",
        numSeeds: "1",
        version: "Colabfold 1.5.2",
        useDropout: false,
    },
    esmfold: {
        numRecycles: "3",
        numCopies: "1",
    },
    omegafold: {
        numCycle: "4",
        numPseudoMSAs: "1",
        pseudoMSAMask: "0.2",
    },
});
