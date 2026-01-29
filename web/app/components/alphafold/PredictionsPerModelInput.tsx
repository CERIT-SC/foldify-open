import { Hint } from "@/app/components/Hint";

interface PredictionsPerModelInputProps {
    predictionsPerModel: string;
    onChange: (value: string) => void;
}

export default function PredictionsPerModelInput({ predictionsPerModel, onChange }: PredictionsPerModelInputProps) {
    const increment = () => {
        const currentValue = parseInt(predictionsPerModel) || 5;
        const newValue = Math.min(currentValue + 1, 20);
        onChange(newValue.toString());
    };

    const decrement = () => {
        const currentValue = parseInt(predictionsPerModel) || 5;
        const newValue = Math.max(currentValue - 1, 1);
        onChange(newValue.toString());
    };

    return (
        <div className="flex flex-col w-full">
            <fieldset className="fieldset">
                <legend className="text-sm">
                    <span className="font-semibold mr-2">Predictions per Model</span>
                    <Hint hint="Number of predictions per model. Default is 5." />
                </legend>
                <div className="flex flex-row w-full items-center">
                    <button
                        type="button"
                        onClick={decrement}
                        className="btn btn-outline btn-xs hover:bg-secondary transition-colors duration-200"
                        disabled={parseInt(predictionsPerModel) <= 1}>
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 12H4"
                            />
                        </svg>
                    </button>
                    <input
                        type="number"
                        min="1"
                        max="20"
                        value={predictionsPerModel}
                        onChange={(e) => onChange(e.target.value)}
                        className="input input-border bg-white mx-2 rounded-full text-center text-base"
                        placeholder="5"
                    />
                    <button
                        type="button"
                        onClick={increment}
                        className="btn btn-outline btn-xs hover:bg-secondary transition-colors duration-200"
                        disabled={parseInt(predictionsPerModel) >= 20}>
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                    </button>
                </div>
            </fieldset>
        </div>
    );
}
