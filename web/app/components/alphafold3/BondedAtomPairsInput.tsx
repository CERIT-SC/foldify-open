import { Hint } from "@/app/components/Hint";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";

interface Bond {
    id: string;
    residue: number;
    atom: string;
}

interface BondedAtomPairsInputProps {
    bondedAtomPairs: [Bond, Bond];
    index: number;
    onChange: (index: number, pairIndex: number, field: keyof Bond, value: string | number) => void;
    onRemove: (index: number) => void;
    disabled: boolean;
    errors: Record<string, string>;
}

export const BondedAtomPairsInput = ({ bondedAtomPairs, index, onChange, onRemove, disabled, errors }: BondedAtomPairsInputProps) => {
    return (
        <div className="relative bg-white/80 border border-base-300 rounded-4xl p-3 md:p-4 shadow-sm transition-all duration-200 hover:shadow-md">
            {/* Responsive Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold text-xs">{index + 1}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                        <h3 className="font-medium text-sm text-base-content">Bond Pair {index + 1}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-base-content/50 hidden sm:inline">•</span>
                            <span className="text-xs text-base-content/60">Covalent Bond</span>
                        </div>
                    </div>
                </div>

                {!disabled && (
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="btn btn-ghost btn-xs text-error hover:bg-error/10 rounded-md self-start sm:self-center"
                        title="Remove bond pair">
                        <XMarkIcon className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* Responsive Bond Pair Layout */}
            <div className="space-y-4">
                {/* Atom 1 */}
                <div className="bg-base-100/20 rounded-xl p-3">
                    <h4 className="text-xs font-medium text-base-content/80 mb-3 flex items-center gap-2">
                        <span className="w-4 h-4 bg-secondary/40 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold">1</span>
                        </span>
                        First Atom
                    </h4>

                    {/* Responsive Grid - Stack on mobile, 3 columns on larger screens */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <fieldset className="fieldset w-full">
                            <legend className="flex flex-row gap-1 ml-1 items-center mb-1">
                                <span className="fieldset-legend text-xs">Entity ID *</span>
                                <Hint hint="Must correspond to one of the defined entities above (e.g., A, B, L)." />
                            </legend>
                            <input
                                type="text"
                                placeholder="A"
                                className={`input input-sm sm:input-md w-full bg-white ${errors[`id1-${index}`] ? "input-error" : "input-border"}`}
                                value={bondedAtomPairs[0].id}
                                onChange={(e) => onChange(index, 0, "id", e.target.value)}
                            />
                            {errors[`id1-${index}`] && <p className="text-error text-xs mt-1">{errors[`id1-${index}`]}</p>}
                        </fieldset>

                        <fieldset className="fieldset w-full">
                            <legend className="flex flex-row gap-1 ml-1 items-center mb-1">
                                <span className="fieldset-legend text-xs">Residue #</span>
                                <Hint hint="1-based residue index within the chain. For single-residue ligands, use 1." />
                            </legend>
                            <input
                                type="number"
                                placeholder="145"
                                min="1"
                                className={`input input-sm sm:input-md w-full bg-white ${
                                    errors[`residue1-${index}`] ? "input-error" : "input-border"
                                }`}
                                value={bondedAtomPairs[0].residue}
                                onChange={(e) => onChange(index, 0, "residue", parseInt(e.target.value) || 1)}
                            />
                            {errors[`residue1-${index}`] && <p className="text-error text-xs mt-1">{errors[`residue1-${index}`]}</p>}
                        </fieldset>

                        <fieldset className="fieldset w-full">
                            <legend className="flex flex-row gap-1 ml-1 items-center mb-1">
                                <span className="fieldset-legend text-xs">Atom Name</span>
                                <Hint hint="Unique atom name within the residue (e.g., SG, CA, N1)." />
                            </legend>
                            <input
                                type="text"
                                placeholder="SG"
                                className={`input input-sm sm:input-md w-full bg-white ${errors[`atom1-${index}`] ? "input-error" : "input-border"}`}
                                value={bondedAtomPairs[0].atom}
                                onChange={(e) => onChange(index, 0, "atom", e.target.value)}
                            />
                            {errors[`atom1-${index}`] && <p className="text-error text-xs mt-1">{errors[`atom1-${index}`]}</p>}
                        </fieldset>
                    </div>
                </div>

                {/* Responsive Connection Line */}
                <div className="flex items-center justify-center">
                    <div className="w-8 sm:w-12 h-px bg-base-300"></div>
                    <div className="mx-2 text-xs text-base-content/60 bg-white px-2 rounded whitespace-nowrap">bond</div>
                    <div className="w-8 sm:w-12 h-px bg-base-300"></div>
                </div>

                {/* Atom 2 */}
                <div className="bg-base-100/20 rounded-xl p-3">
                    <h4 className="text-xs font-medium text-base-content/80 mb-3 flex items-center gap-2">
                        <span className="w-4 h-4 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold">2</span>
                        </span>
                        Second Atom
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <fieldset className="fieldset w-full">
                            <legend className="flex flex-row gap-1 ml-1 items-center mb-1">
                                <span className="fieldset-legend text-xs">Entity ID *</span>
                                <Hint hint="Must correspond to one of the defined entities above (e.g., A, B, L)." />
                            </legend>
                            <input
                                type="text"
                                placeholder="L"
                                className={`input input-sm sm:input-md w-full bg-white ${errors[`id2-${index}`] ? "input-error" : "input-border"}`}
                                value={bondedAtomPairs[1].id}
                                onChange={(e) => onChange(index, 1, "id", e.target.value)}
                            />
                            {errors[`id2-${index}`] && <p className="text-error text-xs mt-1">{errors[`id2-${index}`]}</p>}
                        </fieldset>

                        <fieldset className="fieldset w-full">
                            <legend className="flex flex-row gap-1 ml-1 items-center mb-1">
                                <span className="fieldset-legend text-xs">Residue #</span>
                                <Hint hint="1-based residue index within the chain. For single-residue ligands, use 1." />
                            </legend>
                            <input
                                type="number"
                                placeholder="1"
                                min="1"
                                className={`input input-sm sm:input-md w-full bg-white ${
                                    errors[`residue2-${index}`] ? "input-error" : "input-border"
                                }`}
                                value={bondedAtomPairs[1].residue}
                                onChange={(e) => onChange(index, 1, "residue", parseInt(e.target.value) || 1)}
                            />
                            {errors[`residue2-${index}`] && <p className="text-error text-xs mt-1">{errors[`residue2-${index}`]}</p>}
                        </fieldset>

                        <fieldset className="fieldset w-full">
                            <legend className="flex flex-row gap-1 ml-1 items-center mb-1">
                                <span className="fieldset-legend text-xs">Atom Name</span>
                                <Hint hint="Unique atom name within the residue (e.g., C04, O1, N2)." />
                            </legend>
                            <input
                                type="text"
                                placeholder="C04"
                                className={`input input-sm sm:input-md w-full bg-white ${errors[`atom2-${index}`] ? "input-error" : "input-border"}`}
                                value={bondedAtomPairs[1].atom}
                                onChange={(e) => onChange(index, 1, "atom", e.target.value)}
                            />
                            {errors[`atom2-${index}`] && <p className="text-error text-xs mt-1">{errors[`atom2-${index}`]}</p>}
                        </fieldset>
                    </div>
                </div>
            </div>

            {/* Responsive Helper Text */}
            <div className="mt-3 p-2 sm:p-3 bg-primary/5 border rounded-md text-xs text-base-content/70">
                <ReactMarkdown>
                    **Entity IDs must match those defined in your sequences above.** Define covalent bonds between atoms. Example: Chain A residue 145
                    atom SG bonded to ligand L residue 1 atom C04.
                </ReactMarkdown>
            </div>
        </div>
    );
};
