import { Hint } from "@/app/components/Hint";

interface ModelPresetInputProps {
    modelPreset: string;
    onChange: (value: string) => void;
}

export default function ModelPresetInput({ modelPreset, onChange }: ModelPresetInputProps) {
    return (
        <fieldset className="fieldset w-full max-w-5xl mb-4 text-base">
            <legend className="flex flex-row gap-2 ml-2 items-center">
                <span className="fieldset-legend text-sm">Model Preset</span>
                <Hint hint="Model preset to use. ~newline **monomer**: For single protein chains. The original model used at CASP14 with no ensembling. ~newline **monomer_casp14**: Used at CASP14 with num_ensemble=8, matching CASP14 configuration. Provided for reproducibility (8x more computationally expensive for limited accuracy gain). ~newline **monomer_ptm**: Original CASP14 model fine tuned with the pTM head, providing a pairwise confidence measure. ~newline **multimer**: For protein complexes. To use this model you must provide a multi-sequence FASTA file." />
            </legend>

            <select
                value={modelPreset}
                onChange={(e) => onChange(e.target.value)}
                className="select w-full max-w-5xl bg-white pl-4 input-border">
                <option value="monomer">monomer</option>
                <option value="monomer_casp14">monomer_casp14</option>
                <option value="monomer_ptm">monomer_ptm</option>
                <option value="multimer">multimer</option>
            </select>
        </fieldset>
    );
}
