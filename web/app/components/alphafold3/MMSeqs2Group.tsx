import { Hint } from "@/app/components/Hint";

interface MMSeqs2GroupProps {
    precomputedMSA: boolean;
    precomputedTemplates: boolean;
    numberOfTemplates: number;
    onPrecomputedMSAChange: (value: boolean) => void;
    onPrecomputedTemplatesChange: (value: boolean) => void;
    onNumberOfTemplatesChange: (value: number) => void;
}

export default function MMSeqs2Group({
    precomputedMSA,
    precomputedTemplates,
    numberOfTemplates,
    onPrecomputedMSAChange,
    onPrecomputedTemplatesChange,
    onNumberOfTemplatesChange,
}: MMSeqs2GroupProps) {
    return (
        <div className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center gap-3">
                <h3 className="font-medium text-base-content">MSA and Templates</h3>
                <Hint hint="Enable these options to use precomputed MSA and templates for faster predictions. More info about mmseqs2 scripts *[here](https://github.com/hlasimpk/af3_mmseqs_scripts)*." />
            </div>

            {/* Options */}
            <div className="space-y-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Use Generated MSA */}
                <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3 p-3 bg-base-100/30 rounded-lg hover:bg-base-100/50 transition-colors">
                        <input
                            type="checkbox"
                            checked={precomputedMSA}
                            className="checkbox checkbox-primary"
                            onChange={(e) => onPrecomputedMSAChange(e.target.checked)}
                        />
                        <div>
                            <span className="label-text font-medium text-sm">Use precomputed MSA</span>
                            <div className="text-xs text-base-content/60 text-wrap">
                                Faster computation against public MMseqs2 server (unofficial).
                            </div>
                        </div>
                    </label>
                </div>

                {/* Use Generated Templates */}
                <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3 p-3 bg-base-100/30 rounded-lg hover:bg-base-100/50 transition-colors">
                        <input
                            type="checkbox"
                            checked={precomputedTemplates}
                            className="checkbox checkbox-primary"
                            onChange={(e) => onPrecomputedTemplatesChange(e.target.checked)}
                        />
                        <div>
                            <span className="label-text font-medium">Use precomputed templates</span>
                            <div className="text-xs text-base-content/60">Enhanced structure prediction quality</div>
                        </div>
                    </label>
                </div>

                {/* Number of Templates */}
                {precomputedTemplates && (
                    <div className="ml-8 transition-all duration-300">
                        <fieldset className="fieldset w-full max-w-xs">
                            <legend className="flex flex-row gap-2 ml-2 items-center">
                                <span className="fieldset-legend text-sm">Number of Templates</span>
                                <Hint hint="Specify how many template structures to use (1-50)." />
                            </legend>
                            <input
                                type="number"
                                value={numberOfTemplates}
                                min="1"
                                max="50"
                                className="input input-bordered w-full bg-white"
                                onChange={(e) => onNumberOfTemplatesChange(Number(e.target.value))}
                            />
                        </fieldset>
                    </div>
                )}
            </div>
        </div>
    );
}
