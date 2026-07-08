type PaginationBarProps = {
    page: number;
    totalPages: number;
    totalElements: number;
    onPageChange: (page: number) => void;
};

export function PaginationBar({
                                  page,
                                  totalPages,
                                  totalElements,
                                  onPageChange,
                              }: PaginationBarProps) {
    const isFirst = page <= 0;
    const isLast = page >= totalPages - 1;

    return (
        <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
            <p className="text-sm text-zinc-500">
                Page {totalPages === 0 ? 0 : page + 1} of {totalPages} ·{" "}
                {totalElements} records
            </p>

            <div className="flex gap-2">
                <button
                    type="button"
                    disabled={isFirst}
                    onClick={() => onPageChange(page - 1)}
                    className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Previous
                </button>

                <button
                    type="button"
                    disabled={isLast}
                    onClick={() => onPageChange(page + 1)}
                    className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Next
                </button>
            </div>
        </div>
    );
}