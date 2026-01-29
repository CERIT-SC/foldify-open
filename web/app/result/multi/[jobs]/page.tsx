"use client";

import { use, useEffect, useState } from "react";
import { BackHomeButton } from "@/app/components/BackHomeButton";
import Loading from "@/app/components/Loading";
import { FormInfoAlert } from "@/app/components/FormInfoAlert";
import MolViewer from "@/app/components/result/MolViewer";
import axios from "axios";

interface MultiResultPageProps {
    jobs: string;
}

export default function MultiResultPage({ params }: { params: Promise<MultiResultPageProps> }) {
    const { jobs } = use(params);
    const jobNames = jobs ? jobs.split("_").filter((name) => name.trim() !== "") : [];

    const [loading, setLoading] = useState(false);
    const [validStructures, setValidStructures] = useState(null);

    useEffect(() => {
        const fetchStructures = async () => {
            axios
                .get(`/api/flask/result/multi/${jobs}/models`)
                .then((response) => {
                    console.log("Models response:", response.data.models);
                    setValidStructures(response.data.models);
                })
                .catch((error) => {
                    console.error("Error fetching models:", error);
                });

            setLoading(false);
        };

        setLoading(true);
        fetchStructures();
    }, [jobs]);

    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <BackHomeButton />
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary mb-4">Multi-Result Comparison</h1>
                    <p className="text-lg text-base-content/70">
                        Comparing {jobNames.length} {jobNames.length === 1 ? "structure" : "structures"}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                        {jobNames.map((name) => (
                            <div
                                key={name}
                                className="badge badge-primary badge-lg">
                                {name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3D Visualization Section */}
                <div className="rounded-4xl shadow-2xl bg-white/50 p-8 mb-8">
                    <h2 className="text-2xl font-semibold text-base-content mb-6">3D Structure Visualization</h2>

                    {loading ?
                        <div className="py-16">
                            <p className="text-base text-center mb-4">Loading structures...</p>
                            <Loading />
                        </div>
                    : !validStructures ?
                        <FormInfoAlert message="No structure data available for visualization." />
                    :   <div>
                            <div className="my-3 rounded-lg p-0 bg-base-100 shadow-md">
                                <MolViewer
                                    structureData={validStructures}
                                    format="multiple"
                                    height="40rem"
                                    showRMSD={true}
                                />
                            </div>
                        </div>
                    }
                </div>
            </div>
        </>
    );
}
