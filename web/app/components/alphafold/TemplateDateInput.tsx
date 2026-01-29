import { Hint } from "@/app/components/Hint";
import { DayPicker } from "react-day-picker";

interface TemplateDateProps {
    templateDate: string;
    onChange: (value: string) => void;
}

export default function TemplateDateInput({ templateDate, onChange }: TemplateDateProps) {
    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            onChange(date.toISOString().split("T")[0]);
        } else {
            onChange("");
        }
    };

    const selectedDate = templateDate ? new Date(templateDate) : undefined;

    return (
        <div className="flex flex-col w-full">
            <fieldset className="fieldset">
                <legend className="text-sm">
                    <span className="font-semibold mr-2">Maximum Template Date</span>
                    <Hint hint="AlphaFold will search for the available templates before the date specified; this could be used to avoid certain templates during modeling. ~newline Default values: ~newline 2022-01-01: **Alphafold 2.3.1** ~newline 2020-05-14: **Alphafold 2.2.0**" />
                </legend>
                <button
                    popoverTarget="rdp-popover"
                    className="input input-border w-full bg-white"
                    style={{ anchorName: "--rdp" } as React.CSSProperties}>
                    {templateDate || "Default"}
                </button>
                <div
                    popover="auto"
                    id="rdp-popover"
                    className="dropdown"
                    style={{ positionAnchor: "--rdp" } as React.CSSProperties}>
                    <DayPicker
                        className="react-day-picker"
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                    />
                </div>
            </fieldset>
        </div>
    );
}
