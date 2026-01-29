import { Hint } from "@/app/components/Hint";

interface AdvancedSettingsGroupProps {
    numCopies: string;
    onChangeNumCopies: (value: string) => void;
    numRecycles: string;
    onChangeNumRecycles: (value: string) => void;
}

export default function AdvancedSettingsGroup({ numCopies, onChangeNumCopies, numRecycles, onChangeNumRecycles }: AdvancedSettingsGroupProps) {
    return (
        <div className="grid md:grid-cols-2 gap-6 mb-6 w-full">
            <fieldset className="fieldset w-full max-w-5xl text-base">
                <legend className="flex flex-row gap-2 ml-2 items-center">
                    <span className="fieldset-legend text-sm">Number of Copies</span>
                    <Hint hint="Set number of copies to generate." />
                </legend>

                <input
                    type="number"
                    className="input input-bordered w-full max-w-5xl bg-white input-border"
                    value={numCopies}
                    onChange={(e) => onChangeNumCopies(e.target.value)}
                />
            </fieldset>

            <fieldset className="fieldset w-full max-w-5xl text-base">
                <legend className="flex flex-row gap-2 ml-2 items-center">
                    <span className="fieldset-legend text-sm">Number of Recycles</span>
                    <Hint hint="Set number of recycles to run the model." />
                </legend>

                <select
                    className="select select-bordered w-full max-w-5xl bg-white input-border"
                    value={numRecycles}
                    defaultValue={numRecycles}
                    onChange={(e) => onChangeNumRecycles(e.target.value)}>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="6">6</option>
                    <option value="12">12</option>
                    <option value="24">24</option>
                </select>
            </fieldset>
        </div>
    );
}
