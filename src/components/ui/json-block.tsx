type JsonBlockProps = {
    title: string;
    value: unknown;
};

export function JsonBlock({ title, value }: JsonBlockProps) {
    return (
        <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                {title}
            </p>

            <pre className="max-h-96 overflow-auto rounded-xl border border-white/10 bg-black/40 p-4 text-xs leading-5 text-zinc-300">
        {JSON.stringify(value ?? {}, null, 2)}
      </pre>
        </div>
    );
}