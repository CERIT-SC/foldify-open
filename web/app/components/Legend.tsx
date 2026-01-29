export default function PlddtLegend() {
    return (
        <div className="legend">
            <div className="flex flex-row flex-wrap items-center justify-center gap-4">
                <div className="flex flex-row items-center gap-2">
                    <div className="w-8 h-4 bg-plddt-orange rounded-full"></div>
                    <span>Very low (pLDDT &lt; 50)</span>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <div className="w-8 h-4 bg-plddt-yellow rounded-full"></div>
                    <span>Low (70 &gt; pLDDT &gt; 50)</span>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <div className="w-8 h-4 bg-einfra-cyan rounded-full"></div>
                    <span>Confident (90 &gt; pLDDT &gt; 70)</span>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <div className="w-8 h-4 bg-plddt-blue rounded-full"></div>
                    <span>Very high (pLDDT &gt; 90)</span>
                </div>
            </div>
        </div>
    );
}
