interface ComparisonQualityTableProps {
    rmsdData: Record<string, number>;
    tmScoreData: Record<string, number>;
}

export default function ComparisonQualityTable({ rmsdData, tmScoreData }: ComparisonQualityTableProps) {
    if (Object.keys(rmsdData).length === 0) {
        return null;
    }

    return (
        <div className="mb-6 flex justify-center">
            <div className="overflow-x-auto max-w-full">
                <table className="table w-auto min-w-2xl">
                    <thead>
                        <tr>
                            <th>Model</th>
                            <th className="text-right">RMSD (Å)</th>
                            <th className="text-right">TM-score</th>
                            <th className="text-right">Quality <br /><span className="text-xs">(based on RMSD)</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(rmsdData).map(([name, rmsd]) => {
                            const tmScore = tmScoreData[name];
                            return (
                                <tr
                                    key={name}
                                    className="hover">
                                    <td className="font-medium">{name.split("-").pop()}</td>
                                    <td className="text-right tabular-nums">
                                        {rmsd === 0 ? <span className="text-primary font-semibold">Reference</span> : rmsd.toFixed(2)}
                                    </td>
                                    <td className="text-right tabular-nums">{tmScore !== undefined ? tmScore.toFixed(4) : "N/A"}</td>
                                    <td className="text-right">
                                        {rmsd === 0 ? (
                                            <span className="badge badge-outline badge-sm">Reference</span>
                                        ) : rmsd < 2.0 ? (
                                            <span className="badge badge-success badge-sm">Excellent</span>
                                        ) : rmsd < 3.0 ? (
                                            <span className="badge badge-success badge-sm">Good</span>
                                        ) : rmsd < 5.0 ? (
                                            <span className="badge bg-amber-400 badge-sm">Moderate</span>
                                        ) : (
                                            <span className="badge badge-error badge-sm">Poor</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
