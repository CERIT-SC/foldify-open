interface TechnicalOutputProps {
    stdout: string;
}

export default function Configuration({ stdout }: TechnicalOutputProps) {
    return (
        <div className="">
            <h2 className="text-lg font-medium mb-2">Technical Output</h2>
            <textarea
                className="w-full p-4 border rounded-md resize-none bg-base-100 shadow-md"
                value={stdout}
                rows={22}
                readOnly></textarea>
        </div>
    );
}
