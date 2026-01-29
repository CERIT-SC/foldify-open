import ReactMarkdown from "react-markdown";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface FormInfoAlertProps {
    message: string;
}

export const FormInfoAlert = ({ message }: FormInfoAlertProps) => {
    return (
        <div
            role="alert"
            className="alert w-full max-w-3xl my-2 bg-white shadow-lg text-sm text-justify self-center mt-4">
            <InformationCircleIcon className="h-6 w-6 text-accent mr-2 flex-shrink-0" />
            <ReactMarkdown>{message}</ReactMarkdown>
        </div>
    );
};
