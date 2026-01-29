import { Hint } from "@/app/components/Hint";

interface EmailInputProps {
    email: string;
    onChange: (value: string) => void;
    error?: string;
}

export default function EmailInput({ email, onChange, error }: EmailInputProps) {
    return (
        <fieldset className="fieldset w-full max-w-5xl mb-4 text-base">
            <legend className="flex flex-row gap-2 ml-2 items-center">
                <span className="fieldset-legend text-sm">E-mail</span>
                <Hint hint="Enter your email address to receive notifications about the job status." />
            </legend>

            <input
                type="email"
                className={`input w-full max-w-5xl bg-white pl-4 ${error ? "input-error" : "input-border"}`}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => onChange(e.target.value)}
            />
            <p className="label text-error text-xs mt-1">{error}</p>
        </fieldset>
    );
}
