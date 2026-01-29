import { Hint } from "@/app/components/Hint";

interface TemplateModeInputProps {
    templateMode: string;
    onChange: (value: string) => void;
    error?: string;
}

export default function TemplateModeInput({ templateMode, onChange, error }: TemplateModeInputProps) {
    return (
        <fieldset className="fieldset w-full max-w-5xl mb-4 text-base">
            <legend className="flex flex-row gap-2 ml-2 items-center">
                <span className="fieldset-legend text-sm">Template Mode</span>
                <Hint hint="**none**: No template information is used. ~newline **pdb70**: Detect templates in pdb70." />
            </legend>

            <select
                className={`select select-bordered w-full max-w-5xl bg-white ${error ? "input-error" : "input-border"}`}
                value={templateMode}
                onChange={(e) => onChange(e.target.value)}>
                <option value="none">none</option>
                <option value="pdb70">pdb70</option>
            </select>
            <p className="label text-error text-xs mt-1">{error}</p>
        </fieldset>
    );
}
