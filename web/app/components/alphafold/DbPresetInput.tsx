import { Hint } from "@/app/components/Hint";

interface DbPresetInputProps {
    dbPreset: string;
    onChange: (value: string) => void;
}

export default function DbPresetInput({ dbPreset, onChange }: DbPresetInputProps) {
    return (
        <fieldset className="fieldset w-full max-w-5xl mb-4 text-base">
            <legend className="flex flex-row gap-2 ml-2 items-center">
                <span className="fieldset-legend text-sm">Database Preset</span>
                <Hint hint="MSA speed/quality tradeoff. ~newline **reduced_dbs**: This preset is optimized for speed and lower hardware requirements. It runs with a reduced version of the BFD database. ~newline **full_dbs**: This runs with all genetic databases used at CASP14." />
            </legend>

            <select
                value={dbPreset}
                onChange={(e) => onChange(e.target.value)}
                className="select w-full max-w-5xl bg-white pl-4 input-border">
                <option value="full_dbs">full_dbs</option>
                <option value="reduced_dbs">reduced_dbs</option>
            </select>
        </fieldset>
    );
}
