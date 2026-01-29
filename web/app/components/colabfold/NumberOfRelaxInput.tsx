import { Hint } from "@/app/components/Hint";

interface NumberOfRelaxInputProps {
    numberOfRelax: string;
    onChange: (value: string) => void;
    error?: string;
}

export default function NumberOfRelaxInput({ numberOfRelax, onChange, error }: NumberOfRelaxInputProps) {
    return (
        <fieldset className="fieldset w-full max-w-5xl mb-4 text-base">
            <legend className="flex flex-row gap-2 ml-2 items-center">
                <span className="fieldset-legend text-sm">Number of Relax</span>
                <Hint hint="Specify how many of the top ranked structures to relax using amber." />
            </legend>

            <select
                className={`select select-bordered w-full max-w-5xl bg-white ${error ? "input-error" : "input-border"}`}
                value={numberOfRelax}
                onChange={(e) => onChange(e.target.value)}>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="5">5</option>
            </select>
            <p className="label text-error text-xs mt-1">{error}</p>
        </fieldset>
    );
}
