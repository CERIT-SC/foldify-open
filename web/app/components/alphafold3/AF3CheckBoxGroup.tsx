interface CheckBoxGroupProps {
    forceComputation: boolean;
    makeResultsPublic: boolean;
    onForceComputationChange: (value: boolean) => void;
    onMakeResultsPublicChange: (value: boolean) => void;
}

export const CheckBoxGroup = ({
                                  forceComputation,
                                  onForceComputationChange,
                              }: CheckBoxGroupProps) => {
    const checkboxOptions = [
        {
            id: "forceComputation",
            label: "Force Computation",
            description: "Force re-computation even if results exist",
            checked: forceComputation,
            onChange: onForceComputationChange,
        },
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {checkboxOptions.map((option) => (
                    <label
                        key={option.id}
                        className="card bg-white/50 hover:bg-base-100 shadow-sm cursor-pointer transition-colors">
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
};
