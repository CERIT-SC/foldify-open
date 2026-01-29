import { FileUpload } from "./FileUpload";
import { Hint } from "@/app/components/Hint";
import { ArrowDownOnSquareIcon, DocumentIcon } from "@heroicons/react/24/outline";

interface CCDFileUploadProps {
    userCCDFile: File | null;
    setUserCCDFile: (file: File | null) => void;
    errorsCCD: {
        userCCDFile?: string;
    };
}

export default function CCDFileUpload({ userCCDFile, setUserCCDFile, errorsCCD }: CCDFileUploadProps) {
    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 mt-10">
                <h3 className="font-medium text-base sm:text-lg text-base-content">Custom Component Dictionary</h3>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-base-300 rounded-3xl p-4 md:p-6 shadow-sm">
                {/* Responsive Description */}
                <p className="text-sm text-base-content/60 mb-6 leading-relaxed">
                    Upload custom ligand definitions for specialized molecular components not available in the standard CCD database.
                </p>

                {/* File Upload Section */}
                <div className="space-y-4">
                    <FileUpload
                        id="user_ccd_file_input"
                        onChange={(userCCDFile) => setUserCCDFile(userCCDFile)}
                        error={errorsCCD.userCCDFile}
                        label="CCD File"
                        hint="Select a .cif file containing your custom component definitions"
                    />

                    {/* Responsive Help Section */}
                    <div className="bg-accent/5 border border-accent/20 rounded-3xl p-3 md:p-4">
                        <div className="space-y-3">
                            {/* Requirements */}
                            <div>
                                <h4 className="text-sm font-medium text-base-content mb-1">Requirements</h4>
                                <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed">
                                    Reference custom components in your sequences section with matching{" "}
                                    <code className="bg-base-300 px-1 rounded text-xs">data_…</code> IDs from your CIF file.
                                </p>
                            </div>

                            {/* Responsive Resources */}
                            <div>
                                <h4 className="text-sm font-medium text-base-content mb-2">Resources</h4>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                    <a
                                        className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-focus hover:underline transition-colors"
                                        href="./exampleCCD.cif"
                                        download>
                                        <ArrowDownOnSquareIcon className="w-4 h-4" />
                                        <span>Download example</span>
                                    </a>
                                    <a
                                        className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-focus hover:underline transition-colors"
                                        href="https://www.wwpdb.org/data/ccd#mmcifFormat"
                                        target="_blank"
                                        rel="noopener noreferrer">
                                        <DocumentIcon className="w-4 h-4" />
                                        <span>Format guidelines</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
