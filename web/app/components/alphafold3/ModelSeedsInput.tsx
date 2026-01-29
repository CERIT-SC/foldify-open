import { Hint } from "@/app/components/Hint";

interface ModelSeedsInputProps {
    modelSeeds: string;
    onChange: (value: string) => void;
    error?: string;
}

export const ModelSeedsInput = ({ modelSeeds, onChange, error }: ModelSeedsInputProps) => {
    return (
        <fieldset className="fieldset w-full max-w-5xl mb-4 text-base">
            <legend className="flex flex-row gap-2 ml-2 items-center">
                <span className="fieldset-legend text-sm">Model Seeds *</span>
                <Hint hint="A list of integer random seeds. The pipeline and the model will be invoked with each of the seeds in the list. ~newline I.e. if you provide *n* random seeds, you will get *n* predicted structures, each with the respective random seed. You must provide at least one random seed." />
            </legend>

            <input
                type="text"
                className={`input w-full max-w-5xl bg-white pl-4 ${error ? "input-error" : "input-border"}`}
                placeholder="1,2,3"
                value={modelSeeds}
                onChange={(e) => onChange(e.target.value)}
            />
            <p className="label text-error text-xs mt-1">{error}</p>
        </fieldset>
    );
};
