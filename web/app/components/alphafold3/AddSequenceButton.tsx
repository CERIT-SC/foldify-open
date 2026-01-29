import { PlusIcon } from "@heroicons/react/24/outline";

interface AddSequenceButtonProps {
    onClick: () => void;
    sequenceEntity?: boolean;
}

export const AddSequenceButton = ({ onClick, sequenceEntity = true }: AddSequenceButtonProps) => {
    return (
        <>
            {sequenceEntity ? (
                <button
                    type="button"
                    onClick={onClick}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-white/80 backdrop-blur-sm border border-dashed border-primary/30 rounded-xl text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 hover:shadow-md group">
                    <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <PlusIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-left">
                        <div className="font-medium text-sm text-base-content">Add Entity</div>
                        <div className="text-xs text-base-content/60">Click to add another protein, RNA, DNA, or ligand</div>
                    </div>
                </button>
            ) : (
                <button
                    type="button"
                    onClick={onClick}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-white/80 backdrop-blur-sm border border-dashed border-primary/30 rounded-xl text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 hover:shadow-md group">
                    <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <PlusIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-left">
                        <div className="font-medium text-sm text-base-content">Add Atom Pair</div>
                        <div className="text-xs text-base-content/60">Click to add bonded atom pair.</div>
                    </div>
                </button>
            )}
        </>
    );
};
