import { useState } from "react";

interface Bond {
    id: string;
    residue: number;
    atom: string;
}

export const useBondInput = (initialBonds: [Bond, Bond][]) => {
    const [bonds, setBonds] = useState<[Bond, Bond][]>(initialBonds);

    const addBond = () => {
        setBonds([
            ...bonds,
            [
                { id: "", residue: 1, atom: "" },
                { id: "", residue: 1, atom: "" },
            ],
        ]);
    };

    const removeBond = (index: number) => {
        setBonds(bonds.filter((_, i) => i !== index));
    };

    const handleBondChange = (pairIndex: number, atomIndex: number, field: keyof Bond, value: string | number) => {
        setBonds((prevPairs) => {
            const newPairs = [...prevPairs];
            newPairs[pairIndex] = [...newPairs[pairIndex]] as [Bond, Bond];

            newPairs[pairIndex][atomIndex] = {
                ...newPairs[pairIndex][atomIndex],
                [field]: value,
            };

            return newPairs;
        });
    };

    return { bonds, addBond, removeBond, handleBondChange };
};
