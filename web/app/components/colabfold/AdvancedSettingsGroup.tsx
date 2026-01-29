import { Hint } from "@/app/components/Hint";

interface AdvancedSettingsGroupProps {
    numModels: string;
    onNumModelsChange: (value: string) => void;
    numRecycles: string;
    onNumRecyclesChange: (value: string) => void;
    recycleTolerance: string;
    onRecycleToleranceChange: (value: string) => void;
    maxMSA: string;
    onMaxMSAChange: (value: string) => void;
    numSeeds: string;
    onNumSeedsChange: (value: string) => void;
}

export default function AdvancedSettingsGroup({
    numModels,
    onNumModelsChange,
    numRecycles,
    onNumRecyclesChange,
    recycleTolerance,
    onRecycleToleranceChange,
    maxMSA,
    onMaxMSAChange,
    numSeeds,
    onNumSeedsChange,
}: AdvancedSettingsGroupProps) {
    return (
        <div className="grid md:grid-cols-3 gap-6 mb-6 w-full">
            <fieldset className="fieldset w-full max-w-5xl text-base">
                <legend className="flex flex-row gap-2 ml-2 items-center">
                    <span className="fieldset-legend text-sm">Number of Models</span>
                    <Hint hint="Number of models to generate. Default is 5." />
                </legend>

                <select
                    className="select select-bordered w-full max-w-5xl bg-white input-border"
                    defaultValue={numModels}
                    value={numModels}
                    onChange={(e) => onNumModelsChange(e.target.value)}>
                    <option value="5">5</option>
                    <option value="4">4</option>
                    <option value="3">3</option>
                    <option value="2">2</option>
                    <option value="1">1</option>
                </select>
            </fieldset>

            <fieldset className="fieldset w-full max-w-5xl text-base">
                <legend className="flex flex-row gap-2 ml-2 items-center">
                    <span className="fieldset-legend text-sm">Number of Recycles</span>
                    <Hint hint="If **auto** and **model_type=alphafold2_multimer_v3** is selected, will use `num_recycles=20`, else `num_recycles=3`." />
                </legend>

                <select
                    className="select select-bordered w-full max-w-5xl bg-white input-border"
                    defaultValue={numRecycles}
                    value={numRecycles}
                    onChange={(e) => onNumRecyclesChange(e.target.value)}>
                    <option value="auto">auto</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="3">3</option>
                    <option value="6">6</option>
                    <option value="12">12</option>
                    <option value="24">24</option>
                    <option value="48">48</option>
                </select>
            </fieldset>

            <fieldset className="fieldset w-full max-w-5xl text-base">
                <legend className="flex flex-row gap-2 ml-2 items-center">
                    <span className="fieldset-legend text-sm">Recycle Tolerance</span>
                    <Hint hint="Tolerance for recycling. Default is 0.001." />
                </legend>

                <select
                    className="select select-bordered w-full max-w-5xl bg-white input-border"
                    defaultValue={recycleTolerance}
                    value={recycleTolerance}
                    onChange={(e) => onRecycleToleranceChange(e.target.value)}>
                    <option value="auto">auto</option>
                    <option value="0.0">0.0</option>
                    <option value="0.5">0.5</option>
                    <option value="1.0">1.0</option>
                </select>
            </fieldset>

            <fieldset className="fieldset w-full max-w-5xl text-base">
                <legend className="flex flex-row gap-2 ml-2 items-center">
                    <span className="fieldset-legend text-sm">Max MSA</span>
                    <Hint hint="Decrease max_msa to reduce memory requirements but increase uncertainity. Increase it for more diversity in the MSA." />
                </legend>

                <select
                    className="select select-bordered w-full max-w-5xl bg-white input-border"
                    defaultValue={maxMSA}
                    value={maxMSA}
                    onChange={(e) => onMaxMSAChange(e.target.value)}>
                    <option value="auto">auto</option>
                    <option value="512:1024">512:1024</option>
                    <option value="256:512">256:512</option>
                    <option value="64:128">64:128</option>
                    <option value="32:64">32:64</option>
                    <option value="16:32">16:32</option>
                </select>
            </fieldset>

            <fieldset className="fieldset w-full max-w-5xl text-base">
                <legend className="flex flex-row gap-2 ml-2 items-center">
                    <span className="fieldset-legend text-sm">Number of Seeds</span>
                    <Hint hint="Enable dropouts and increase number of seeds to sample predictions from uncertainty of the model." />
                </legend>

                <select
                    className="select select-bordered w-full max-w-5xl bg-white input-border"
                    value={numSeeds}
                    defaultValue={numSeeds}
                    onChange={(e) => onNumSeedsChange(e.target.value)}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="4">4</option>
                    <option value="8">8</option>
                    <option value="16">16</option>
                </select>
            </fieldset>
        </div>
    );
}
