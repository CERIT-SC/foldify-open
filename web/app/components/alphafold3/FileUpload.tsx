import { Hint } from "@/app/components/Hint";

interface FileUploadProps {
    id: string;
    onChange: (file: File | null) => void;
    error?: string;
    hint?: string;
    label?: string;
}

export const FileUpload = ({ id, onChange, error, hint, label }: FileUploadProps) => {
    return (
        <fieldset className="fieldset w-full max-w-5xl mb-4 text-base">
            <legend className="flex flex-row gap-2 ml-2 items-center">
                <span className="fieldset-legend text-sm">{label || "File Upload"}</span>
                {hint && <Hint hint={hint} />}
            </legend>

            <input
                type="file"
                id={id}
                name="file_input"
                className={`file-input file-input-bordered w-full max-w-5xl bg-white ${error ? "file-input-error" : ""}`}
                onChange={(e) => onChange(e.target.files?.[0] || null)}
            />
            <p className="label text-error text-xs mt-1">{error}</p>
        </fieldset>
    );
};
