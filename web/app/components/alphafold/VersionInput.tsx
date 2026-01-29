import { Hint } from "@/app/components/Hint";

interface VersionInputProps {
    version: string;
    onChange: (value: string) => void;
}

export default function VersionInput({ version, onChange }: VersionInputProps) {
    return (
        <fieldset className="fieldset w-full max-w-5xl mb-4 text-base">
            <legend className="flex flex-row gap-2 ml-2 items-center">
                <span className="fieldset-legend text-sm">AlphaFold Version</span>
                <Hint hint="Select version of Alphafold model to use. Default is 2.3.1." />
            </legend>

            <select
                value={version}
                onChange={(e) => onChange(e.target.value)}
                className="select w-full max-w-5xl bg-white pl-4 input-border">
                <option value="Alphafold 2.3.1">Alphafold 2.3.1</option>
                <option value="Alphafold 2.2.0">Alphafold 2.2.0</option>
            </select>
        </fieldset>
    );
}
