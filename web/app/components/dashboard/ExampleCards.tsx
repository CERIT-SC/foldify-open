import ExampleCard from "@/app/components/dashboard/ExampleCard";
import Link from "next/link";

import cyp2c9ExampleData from "@/public/exampleproteins/cyp2c9-50ola_model.json";
import porinExampleData from "@/public/exampleproteins/porin.json";
import dipeptExampleData from "@/public/exampleproteins/dipept.json";

const EXAMPLE_CONFIGS = [
    {
        title: "Cytochrome P450 2C9",
        description:
            "Cytochrome P450 2C9 (CYP2C9) is one of the major drug-metabolising proteins in the human liver, metabolising a large range of drugs, e.g. weakly acidic NSAIDs such as ibuprofen.",
        tool: "AlphaFold 3",
        jobName: "cyp2c9-50ola",
        data: cyp2c9ExampleData.model,
        format: "pdb",
    },
    {
        title: "Porin: Non-selective voltage-gated ion channel VDAC2",
        description:
            "Non-selective voltage-gated ion channel that mediates the transport of anions and cations through the mitochondrion outer membrane and plasma membrane (PubMed:8420959).",
        tool: "Multifold",
        jobName: "multi/MULTIFOLD-porin-AF3_MULTIFOLD-porin-EMF_MULTIFOLD-porin-CBF_MULTIFOLD-porin-OMF_MULTIFOLD-porin-AF2",
        data: porinExampleData.models,
        format: "multiple",
    },
    {
        title: "Dipeptidylpeptidase IV, N-terminal domain",
        description: "The example of 746 residues demonstrates the large protein complex prediction using Multifold. Predictions over 600 tokens are available in the full Foldify version at **[https://foldify.cloud.e-infra.cz](https://foldify.cloud.e-infra.cz)**.",
        tool: "Multifold",
        jobName: "multi/MULTIFOLD-dipept-AF3_MULTIFOLD-dipept-OMF_MULTIFOLD-dipept-EMF",
        data: dipeptExampleData.models,
        format: "multiple",
    },
];

export default function ExampleCards() {
    return (
        <section
            className="flex flex-col py-8 px-4 sm:px-8 lg:px-12"
            id="examples"
            aria-labelledby="examples-heading">
            <div className="max-w-6xl mx-auto w-full">
                <header className="text-center mb-8">
                    <h1
                        id="examples-heading"
                        className="text-3xl lg:text-4xl font-bold text-primary mb-4">
                        Example Protein Structures
                    </h1>
                    <p className="text-base text-base-content/80 mx-auto leading-relaxed">
                        Explore these pre-computed examples to see our platform in action. Each structure demonstrates
                        different prediction
                        capabilities and methodologies.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-20">
                    {EXAMPLE_CONFIGS.map((config, index) => (
                        <div
                            key={config.jobName}
                            className="flex justify-center ">
                            <ExampleCard
                                title={config.title}
                                description={config.description}
                                tool={config.tool}
                                exampleData={config.data}
                                jobName={config.jobName}
                                format={config.format}
                            />
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-sm text-base-content/60 mb-4">Want to try with your own protein sequence?</p>
                    <Link
                        href="#get-started"
                        className="btn btn-outline btn-primary">
                        Start New Prediction
                    </Link>
                </div>
            </div>
        </section>
    );
}
