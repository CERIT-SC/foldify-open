import { useMemo } from "react";

export const useUserCCDValidation = (userCCDFile: File | null) => {
    return useMemo(() => {
        let errorsCCD: any = {};

        if (userCCDFile && !userCCDFile.name.endsWith(".cif")) {
            errorsCCD.userCCDFile = "Please upload a .cif file.";
        }

        return { errorsCCD, isFileValid: Object.keys(errorsCCD).length === 0 };
    }, [userCCDFile]);
};
