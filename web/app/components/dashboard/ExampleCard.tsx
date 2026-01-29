import MolViewer from "@/app/components/result/MolViewer";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface ExampleCardProps {
    title: string;
    description: string;
    tool: string;
    exampleData: string | Record<string, any>;
    jobName: string;
    format: string;
}

export default function ExampleCard({title, description, tool, exampleData, jobName, format}: ExampleCardProps) {
    // Special-case card styling for a particular example title
    const specialTitle = "Dipeptidylpeptidase IV, N-terminal domain";
    const isSpecial = (title || "").trim() === specialTitle;

    const articleClassName = `card relative bg-base-100 w-96 shadow-xl transition-transform duration-200 hover:scale-110 ${isSpecial ? 'border-2 border-primary' : ''}`;

    return (
        <article className={articleClassName}>

            <figure className="px-10 pt-10">
                <MolViewer
                    structureData={exampleData}
                    format={format}
                    width={300}
                    height="20rem"
                />
            </figure>
            <div className="card-body p-6">
                <header>
                    <h2 className="card-title font-bold text-xl text-base-content mb-2">{title}</h2>
                </header>

                <ReactMarkdown>{description}</ReactMarkdown>

                <footer className="card-actions flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-base-content/60">Tool:</span>
                        <div className="badge badge-ghost text-primary font-bold">{tool}</div>
                    </div>

                    <Link
                        href={`/result/${jobName}`}
                        className="btn btn-primary btn-sm transition-all duration-200 hover:scale-110"
                        aria-label={`View details for ${title}`}>
                        <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                        </svg>
                        View Details
                    </Link>
                </footer>
            </div>
        </article>
    );
}
