import { Hint } from "@/app/components/Hint";

interface AdvancedSettingsGroupProps {
    numCycle: string;
    onChangeNumCycle: (value: string) => void;
    numPseudoMSAs: string;
    onChangeNumPseudoMSAs: (value: string) => void;
    pseudoMSAMask: string;
    onChangePseudoMSAMask: (value: string) => void;
}

export default function AdvancedSettingsGroup({
    numCycle,
    onChangeNumCycle,
    numPseudoMSAs,
    onChangeNumPseudoMSAs,
    pseudoMSAMask,
    onChangePseudoMSAMask,
}: AdvancedSettingsGroupProps) {
    return (
        <div className="grid md:grid-cols-3 gap-6 mb-6 w-full">
            <fieldset className="fieldset w-full max-w-5xl text-base">
                <legend className="flex flex-row gap-2 ml-2 items-center">
                    <span className="fieldset-legend text-sm">Number of Cycles</span>
                    <Hint hint="Set number of cycles to run the model." />
                </legend>

                <select
                    className="select select-bordered w-full max-w-5xl bg-white input-border"
                    value={numCycle}
                    defaultValue={numCycle}
                    onChange={(e) => onChangeNumCycle(e.target.value)}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="4">4</option>
                    <option value="8">8</option>
                    <option value="16">16</option>
                    <option value="32">32</option>
                </select>
            </fieldset>

            <fieldset className="fieldset w-full max-w-5xl text-base">
                <legend className="flex flex-row gap-2 ml-2 items-center">
                    <span className="fieldset-legend text-sm">Number of Pseudo MSAs</span>
                    <Hint hint="Set number of pseudo MSAs to generate." />
                </legend>

                <input
                    type="number"
                    className="input input-bordered w-full max-w-5xl bg-white input-border"
                    value={numPseudoMSAs}
                    onChange={(e) => onChangeNumPseudoMSAs(e.target.value)}
                />
            </fieldset>

            <fieldset className="fieldset w-full max-w-5xl text-base">
                <legend className="flex flex-row gap-2 ml-2 items-center">
                    <span className="fieldset-legend text-sm">Pseudo MSA Mask</span>
                    <Hint hint="Set the mask rate for pseudo MSAs." />
                </legend>

                <input
                    type="number"
                    step={0.1}
                    className="input input-bordered w-full max-w-5xl bg-white input-border"
                    value={pseudoMSAMask}
                    defaultValue={pseudoMSAMask}
                    onChange={(e) => onChangePseudoMSAMask(e.target.value)}
                />
            </fieldset>
        </div>
    );
}
