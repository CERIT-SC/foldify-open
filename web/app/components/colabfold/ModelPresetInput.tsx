"use client";

import { Hint } from "../Hint";

interface ModelPreset {
    id: string;
    name: string;
    description: string;
}

interface ModelPresetInputProps {
    modelPreset: string;
    onChange: (preset: string) => void;
}

const modelPresets: ModelPreset[] = [
    {
        id: "alphafold2_ptm",
        name: "AlphaFold2 PTM",
        description: "Standard AlphaFold2 with predicted TM-score confidence (recommended)",
    },
    {
        id: "alphafold2_multimer_v3",
        name: "AlphaFold2 Multimer v3",
        description: "For protein complexes - latest version (recommended for complexes)",
    },
    {
        id: "alphafold2",
        name: "AlphaFold2",
        description: "Original AlphaFold2 model without PTM head",
    },
    {
        id: "alphafold2_multimer_v1",
        name: "AlphaFold2 Multimer v1",
        description: "For protein complexes - first version",
    },
    {
        id: "alphafold2_multimer_v2",
        name: "AlphaFold2 Multimer v2",
        description: "For protein complexes - improved version",
    },
];

export default function ModelPresetInput({ modelPreset, onChange }: ModelPresetInputProps) {
    return (
        <div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modelPresets.map((preset) => (
                    <div
                        key={preset.id}
                        onClick={() => onChange(preset.id)}
                        className={`
                            p-4 rounded-3xl border-1 shadow-md cursor-pointer transition-all duration-200 transform hover:scale-105
                            ${
                                modelPreset === preset.id
                                    ? "border-primary bg-gradient-to-br from-secondary/40 to-secondary/5 shadow-lg shadow-primary/20"
                                    : "border-base-300 bg-gradient-to-br from-base-100 to-base-50 hover:border-primary/50"
                                    
                            }
                        `}>
                        <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-base leading-tight">{preset.name}</h4>
                            <div
                                className={`
                                w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-2 mt-0.5
                                ${modelPreset === preset.id ? "border-primary bg-primary" : "border-base-400"}
                            `}>
                                {modelPreset === preset.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </div>
                        </div>
                        <p className="text-sm text-base-content/70 leading-relaxed">{preset.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
