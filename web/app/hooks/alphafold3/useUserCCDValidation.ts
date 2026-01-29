import { useEffect, useState } from "react";

export const useUserCCDValidation = (userCCDFile: File | null) => {
    const [errorsCCD, setErrorsCCD]: any = useState({});
    const [isFileValid, setIsFileValid] = useState<boolean>(false);

    useEffect(() => {
        validateUserCCDInput();
    }, [userCCDFile]);

    const validateUserCCDInput = () => {
        let errorsCCD: any = {};

        const userCCDInput = document.getElementById("user_ccd_file_input") as HTMLInputElement;
        const userCCDFileFromInput = userCCDInput?.files?.[0];

        if (userCCDFileFromInput && !userCCDFileFromInput.name.endsWith(".cif")) {
            errorsCCD.userCCDFile = "Please upload a .cif file.";
        }

        setErrorsCCD(errorsCCD);
        setIsFileValid(Object.keys(errorsCCD).length === 0);
    };

    return { errorsCCD, isFileValid };
};
