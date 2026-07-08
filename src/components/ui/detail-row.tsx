type DetailRowProps = {
    label: string;
    value: string;
};

export function DetailRow({ label, value }: DetailRowProps) {
    return (
        <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">
                {label}
            </p>
            <p className="mt-1 break-all text-zinc-300">{value}</p>
        </div>
    );
}
