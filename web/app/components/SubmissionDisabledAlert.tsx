import ReactMarkdown from "react-markdown";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const SUBMISSION_DISABLED_MESSAGE =
    "**Job submission is disabled on this instance** due to high demand on computational resources. " +
    "You can still browse the example predictions and your existing results.\n\n" +
    "To run predictions, deploy Foldify on your own hardware from [GitHub](https://github.com/CERIT-SC/foldify-open), " +
    "or use the full version at [foldify.cloud.e-infra.cz](https://foldify.cloud.e-infra.cz) after " +
    "[creating a MetaCentrum account](https://metavo.metacentrum.cz/cs/application/index.html).";

export default function SubmissionDisabledAlert() {
    return (
        <div
            role="alert"
            className="alert alert-error sticky top-0 z-50 w-full justify-center rounded-none border-x-0 border-t-0 px-4 py-3 text-sm text-left shadow-md">
            <ExclamationTriangleIcon className="h-6 w-6 shrink-0" />
            <div className="w-full space-y-1">
                <ReactMarkdown
                    components={{
                        a: ({ href, children }) => (
                            <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link font-semibold">
                                {children}
                            </a>
                        ),
                    }}>
                    {SUBMISSION_DISABLED_MESSAGE}
                </ReactMarkdown>
            </div>
        </div>
    );
}
