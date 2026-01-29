import afCardImg from "@/public/alphafold_card_img.jpg";
import af3CardImg from "@/public/af3_header.jpg";
import Card from "@/app/components/dashboard/Card";

export default function ToolCards({}) {
    return (
        <section
            className="py-8 px-4 sm:px-6 lg:px-12 mt-4"
            id="get-started">
            {/* Header Section */}
            <div className="text-center mb-8">
                <div className="inline-block">
                    <h1 className="text-3xl lg:text-4xl font-bold text-primary relative my-4">Select Prediction Tool & Start Your Computation</h1>
                </div>
                <div className="max-w-3xl mx-auto">
                    <p className="text-base text-base-content/80 mx-auto leading-relaxed">
                        Select a tool to predict protein or molecule structures. New to this? Try <strong>AlphaFold 2</strong> for reliable results,
                        or <strong>MultiFold</strong> to compare multiple prediction tools.
                    </p>
                </div>
            </div>

            {/* Responsive Grid for Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
                <Card
                    title="MultiFold"
                    link="/multifold"
                    badgeString="Compare Tools"
                />
                <Card
                    title="AlphaFold 3"
                    image={af3CardImg}
                    link="/alphafold3/v1"
                    badgeString="Latest"
                />
                <Card
                    title="AlphaFold 2"
                    image={afCardImg}
                    link="/alphafold"
                    badgeString="Stable"
                />
                <Card
                    title="ColabFold"
                    link="/colabfold"
                    badgeString="Fast Prediction"
                />
                <Card
                    title="OmegaFold"
                    link="/omegafold"
                />
                <Card
                    title="ESMFold"
                    link="/esmfold"
                />
            </div>
        </section>
    );
}
