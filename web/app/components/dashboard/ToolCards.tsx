import genericCardImg from "@/public/generic_card_img.png";
import Card from "@/app/components/dashboard/Card";

export default function ToolCards({}) {
    return (
        <section
            className="py-8 px-4 sm:px-6 lg:px-12 mt-4"
            id="get-started">
            {/* Header Section */}
            <div className="text-center mb-8">
                <div className="inline-block">
                    <h1 className="text-3xl lg:text-4xl font-bold text-primary relative my-4">Prediction Tools</h1>
                </div>
            </div>

            {/* Responsive Grid for Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
                <Card
                    title="MultiModel Submission"
                    link="/multimodel"
                    badgeString="Compare Tools"
                />
                <Card
                    title="AlphaFold 3"
                    image={genericCardImg}
                    link="/alphafold3/v1"
                    badgeString="Latest"
                />
                <Card
                    title="AlphaFold 2"
                    image={genericCardImg}
                    link="/alphafold"
                    badgeString="Stable"
                />
                <Card
                    title="ColabFold"
                    image={genericCardImg}
                    link="/colabfold"
                    badgeString="Fast Prediction"
                />
                <Card
                    title="OmegaFold"
                    image={genericCardImg}
                    link="/omegafold"
                />
                <Card
                    title="ESMFold"
                    image={genericCardImg}
                    link="/esmfold"
                />
            </div>
        </section>
    );
}
