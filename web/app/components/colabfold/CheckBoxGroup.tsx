import React from "react";

interface CheckBoxGroupProps {
    forceComputation: boolean;
    onForceComputationChange: (value: boolean) => void;
    makeResultsPublic: boolean;
    onMakeResultsPublicChange: (value: boolean) => void;
    useDropout: boolean;
    onUseDropoutChange: (value: boolean) => void;
}

export default function CheckBoxGroup({
    forceComputation,
    onForceComputationChange,
    makeResultsPublic,
    onMakeResultsPublicChange,
    useDropout,
    onUseDropoutChange,
}: CheckBoxGroupProps) {
    const checkboxOptions = [
        {
            id: "forceComputation",
            label: "Force Computation",
            description: "Force re-computation even if results exist",
            checked: forceComputation,
            onChange: onForceComputationChange,
        },
        {
            id: "makeResultsPublic",
            label: "Make Results Public",
            description: "Allow others to view your results",
            checked: makeResultsPublic,
            onChange: onMakeResultsPublicChange,
        },
        {
            id: "useDropout",
            label: "Use Dropout",
            description: "Apply dropout during inference for uncertainty estimation",
            checked: useDropout,
            onChange: onUseDropoutChange,
        },
    ];

    return (
        <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                {checkboxOptions.map((option) => (
                    <label
                        key={option.id}
                        className="card bg-base-200/50 hover:bg-base-200 cursor-pointer transition-colors">
                        <div className="card-body p-4">
                            <div className="flex items-start space-x-3">
                                <input
                                    type="checkbox"
                                    checked={option.checked}
                                    onChange={(e) => option.onChange(e.target.checked)}
                                    className="checkbox checkbox-primary mt-1"
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-base-content">{option.label}</div>
                                    <div className="text-sm text-base-content/60">{option.description}</div>
                                </div>
                            </div>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
}
