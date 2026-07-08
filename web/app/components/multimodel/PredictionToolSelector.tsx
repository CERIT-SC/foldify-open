"use client";

import { useState } from "react";

interface PredictionTool {
    id: string;
    name: string;
    description: string;
}

interface PredictionToolSelectorProps {
    onSelectionChange: (selectedTools: string[]) => void;
    selectedTools?: string[];
}

const predictionTools: PredictionTool[] = [
    { id: "alphafold3", name: "AlphaFold 3", description: "Latest version with improved accuracy" },
    { id: "alphafold2", name: "AlphaFold 2", description: "Proven and reliable protein folding" },
    { id: "colabfold", name: "ColabFold", description: "Fast and accessible protein folding" },
    { id: "omegafold", name: "OmegaFold", description: "Language model-based prediction" },
    { id: "esmfold", name: "ESMFold", description: "Meta's protein folding model" },
];

export default function PredictionToolSelector({ onSelectionChange, selectedTools = [] }: PredictionToolSelectorProps) {
    const [selected, setSelected] = useState<string[]>(selectedTools);

    const toggleSelection = (toolId: string) => {
        const newSelection = selected.includes(toolId) ? selected.filter((id) => id !== toolId) : [...selected, toolId];

        setSelected(newSelection);
        onSelectionChange(newSelection);
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {predictionTools.map((tool) => (
                    <div
                        key={tool.id}
                        onClick={() => toggleSelection(tool.id)}
                        className={`
                            p-4 rounded-3xl border-1 shadow-md cursor-pointer transition-all duration-200 transform hover:scale-105
                            ${
                                selected.includes(tool.id)
                                    ? "border-primary bg-gradient-to-br from-secondary/40 to-secondary/5 shadow-lg shadow-primary/20"
                                    : "border-base-300 bg-gradient-to-br from-base-100 to-base-50 hover:border-primary/50"
                            }
                        `}>
                        <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-base leading-tight">{tool.name}</h4>
                            <div
                                className={`
                                w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-2 mt-0.5
                                ${selected.includes(tool.id) ? "border-primary bg-primary" : "border-base-400"}
                            `}>
                                {selected.includes(tool.id) && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </div>
                        </div>
                        <p className="text-sm text-base-content/70 leading-relaxed">{tool.description}</p>
                    </div>
                ))}
            </div>
            {selected.length > 0 && (
                <div className="mt-4 text-center">
                    <p className="text-sm text-base-content/70">
                        Selected: {selected.length} tool{selected.length !== 1 ? "s" : ""}
                        {selected.length < 2 && <span className="text-warning ml-2">(Please select at least 2 tools)</span>}
                    </p>
                </div>
            )}
        </div>
    );
}
