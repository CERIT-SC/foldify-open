import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";

export default function DocsPage() {
    const filePath = path.join(process.cwd(), "public", "docs", "docs.md");
    const content = fs.readFileSync(filePath, "utf-8");

    return (
        <main
            className="flex flex-col min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-5xl mx-auto">
                <div className="backdrop-blur-md bg-white/60 border border-white/20 rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12">
                    <article className="prose prose-slate max-w-none">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </article>
                </div>
            </div>
        </main>
    );
}
