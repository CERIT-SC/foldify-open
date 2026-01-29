import Image, { StaticImageData } from "next/image";
import Link from "next/link";

interface CardProps {
    title: string;
    image?: StaticImageData;
    link: string;
    badgeString?: string;
}

export default function Card({ title, image, link, badgeString }: CardProps) {
    return (
        <>
            {title === "MultiFold" ? (
                <Link
                    href={link}
                    className="block h-full">
                    <div className="card bg-linear-to-tr from-einfra-purple to-einfra-violet shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:cursor-pointer h-full">
                        <div className="card-body">
                            <div className="h-6 flex justify-end">{badgeString && <div className="badge badge-outline">{badgeString}</div>}</div>

                            <h2 className="card-title font-bold text-2xl text-gray-100">{title}</h2>
                            <p className="text-gray-200 text-sm flex-grow">Compare multiple prediction tools</p>
                        </div>
                    </div>
                </Link>
            ) : image ? (
                <Link
                    href={link}
                    className="block h-full">
                    <div
                        className="card card-bg-image shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:cursor-pointer h-full"
                        style={{
                            backgroundImage: `url(${image.src})`,
                        }}>
                        <div className="card-body">
                            <div className="h-6 flex justify-end">{badgeString && <div className="badge badge-outline">{badgeString}</div>}</div>

                            <h2 className="card-title font-bold text-2xl text-white">{title}</h2>
                            <p className="text-white text-sm flex-grow mb-6">
                                {title === "AlphaFold 3"
                                    ? "Latest version with advanced capabilities"
                                    : "Reliable and proven protein structure prediction"}
                            </p>
                        </div>
                    </div>
                </Link>
            ) : (
                <Link
                    href={link}
                    className="block h-full">
                    <div className="card bg-linear-to-br from-violet-100 to-transparent shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:cursor-pointer h-full">
                        <div className="card-body">
                            <div className="h-6 flex justify-end">{badgeString && <div className="badge badge-outline">{badgeString}</div>}</div>

                            <h2 className="card-title font-bold text-2xl">{title}</h2>
                            <p className="text-base-content/70 text-sm flex-grow mb-6">
                                {title === "ColabFold"
                                    ? "Fast and efficient protein predictions"
                                    : title === "OmegaFold"
                                    ? "End-to-end protein structure prediction"
                                    : "Fast folding with language models"}
                            </p>
                        </div>
                    </div>
                </Link>
            )}
        </>
    );
}
