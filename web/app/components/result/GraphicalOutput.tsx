import PlddtLegend from "../Legend";
import Image from "next/image";
import Loading from "../Loading";
import MolViewer from "@/app/components/result/MolViewer";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FormInfoAlert } from "../FormInfoAlert";
import ProteinSequenceViewer from "./ProteinSequenceViewer";

interface GraphicalOutputProps {
    structureData: string;
    format: string;
    molstarURL: string;
    loadingPlddt: boolean;
    plddtData: any[];
    proteinSequence?: string | Record<string, string>; // Can be FASTA format string or JSON object
    jobName?: string; // Optional job name for FASTA header
}

export default function GraphicalOutput({
    structureData,
    format,
    molstarURL,
    loadingPlddt,
    plddtData,
    proteinSequence,
    jobName,
}: GraphicalOutputProps) {
    console.log("proteinSequence from GraphicalOutput.tsx", proteinSequence);
    console.log("plddtData", plddtData);
    return (
        <div className="flex flex-col justify-between py-6 px-6 gap-12">
            {/* Protein Sequence Section */}

            {proteinSequence && (
                <ProteinSequenceViewer
                    sequence={proteinSequence || ""}
                    jobName={jobName || "Unknown Job"}
                />
            )}

            {structureData === "" ?
                <FormInfoAlert message="PDB data for 3D visualization are not available."></FormInfoAlert>
            :   <div>
                    <PlddtLegend />
                    <div className="my-3 rounded-lg p-0 bg-base-100 shadow-md flex flex-col">
                        {structureData && (
                            <MolViewer
                                structureData={structureData}
                                format={format}
                                width={1200}
                            />
                        )}
                    </div>
                    <a
                        href={molstarURL}
                        target="_blank"
                        className="flex justify-end m-4 items-center gap-2">
                        <span>Open in</span>
                        <Image
                            src="/molstar-logo.png"
                            alt="molstar"
                            width={80}
                            height={80}
                            className="rounded-xl"
                        />
                    </a>
                </div>
            }

            {/* Graphs */}

            {loadingPlddt ?
                <div>
                    <p className="text-base text-center">Resolving PLDDT Data. In case of large files it might take a while... Please be patient.</p>
                    <Loading />
                </div>
            : !plddtData || plddtData.length === 0 ?
                <FormInfoAlert message="PLDDT data not available."></FormInfoAlert>
            :   <div className="h-96">
                    <h2 className="text-lg font-medium mb-2 text-center">PLDDT Data</h2>
                    <ResponsiveContainer
                        width="100%"
                        height="100%">
                        <LineChart
                            width={500}
                            height={300}
                            data={plddtData}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}>
                            <XAxis />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="model_0"
                                stroke="#f87315"
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="model_1"
                                stroke="#eab305"
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="model_2"
                                stroke="#05b6d3"
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="model_3"
                                stroke="#1d40af"
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="model_4"
                                stroke="#d2022d"
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            }
        </div>
    );
}
