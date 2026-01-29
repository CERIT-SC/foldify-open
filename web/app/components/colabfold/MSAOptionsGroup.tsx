import { Hint } from "@/app/components/Hint";

interface MSAOptionsGroupProps {
    msaMode: string;
    onChangeMSAMode: (value: string) => void;
    pairMode: string;
    onChangePairMode: (value: string) => void;
}

export default function MSAOptionsGroup({ msaMode, onChangeMSAMode, pairMode, onChangePairMode }: MSAOptionsGroupProps) {
    return (
        <div className="grid md:grid-cols-2 gap-6 mb-6 w-full">
            <fieldset className="fieldset w-full max-w-5xl text-base">
                <legend className="flex flex-row gap-2 ml-2 items-center">
                    <span className="fieldset-legend text-sm">MSA Mode</span>
                    <Hint hint="**mmseqs2_uniref_env**: mmseqs2 with uniref90 environment. ~newline **mmseqs2_uniref**: mmseqs2 with uniref90. ~newline **single_sequence**: Single sequence input." />
                </legend>

                <select
                    className={`select select-bordered w-full max-w-5xl bg-white input-border`}
                    value={msaMode}
                    onChange={(e) => onChangeMSAMode(e.target.value)}>
                    <option value="mmseqs2_uniref_env">mmseqs2_uniref_env</option>
                    <option value="mmseqs2_uniref">mmseqs2_uniref</option>
                    <option value="single_sequence">single_sequence</option>
                </select>
            </fieldset>

            <fieldset className="fieldset w-full max-w-5xl text-base">
                <legend className="flex flex-row gap-2 ml-2 items-center">
                    <span className="fieldset-legend text-sm">Pair Mode</span>
                    <Hint hint="**unpaired_paired**: Pair sequences from same species + unpaired MSA. ~newline **unpaired**: Separate MSA for each chain. ~newline **paired**: Only use paired sequences." />
                </legend>

                <select
                    className={`select select-bordered w-full max-w-5xl bg-white input-border`}
                    value={pairMode}
                    onChange={(e) => onChangePairMode(e.target.value)}>
                    <option value="unpaired_paired">unpaired_paired</option>
                    <option value="unpaired">unpaired</option>
                    <option value="paired">paired</option>
                </select>
            </fieldset>
        </div>
    );
}
