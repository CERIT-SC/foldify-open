import { Hint } from "@/app/components/Hint";

interface JobNameInputProps {
    jobName: string;
    onChange: (value: string) => void;
    error?: string;
}

export const JobNameInput = ({ jobName, onChange, error }: JobNameInputProps) => {
    return (
        <fieldset className="fieldset w-full max-w-5xl mb-4 text-base">
            <legend className="flex flex-row gap-2 ml-2 items-center">
                <span className="fieldset-legend text-sm">Job Name *</span>
                <Hint hint="Enter **unique** name of the computation." />
            </legend>

            <input
                type="text"
                className={`input w-full max-w-5xl bg-white pl-4 ${error ? 'input-error' : 'input-border'}`}
                placeholder="Type here"
                value={jobName}
                onChange={(e) => onChange(e.target.value)}
            />
            <p className="label text-error text-xs mt-1">{error}</p>
        </fieldset>
    );
};
