import type { NormalizedLedgerEntry } from "../types";

type LedgerTableProps = {
    entries: NormalizedLedgerEntry[];
    selectedEntryId: string | null;
    onSelectEntry: (entry: NormalizedLedgerEntry) => void;
};

export function LedgerTable({
                                entries,
                                selectedEntryId,
                                onSelectEntry,
                            }: LedgerTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-[0.18em] text-zinc-500">
                <tr>
                    <th className="px-5 py-4">Entry ID</th>
                    <th className="px-5 py-4">Transaction ID</th>
                    <th className="px-5 py-4">Transaction Type</th>
                    <th className="px-5 py-4">Entry Type</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Balance After</th>
                    <th className="px-5 py-4">Created At</th>
                </tr>
                </thead>

                <tbody>
                {entries.map((entry) => (
                    <tr
                        key={entry.id}
                        onClick={() => onSelectEntry(entry)}
                        className={
                            selectedEntryId === entry.id
                                ? "cursor-pointer border-b border-emerald-400/20 bg-emerald-400/5"
                                : "cursor-pointer border-b border-white/10 transition hover:bg-white/[0.04]"
                        }
                    >
                        <td className="px-5 py-4 font-medium text-zinc-100">
                            {entry.entryId}
                        </td>

                        <td className="px-5 py-4 text-zinc-300">
                            {entry.transactionId}
                        </td>

                        <td className="px-5 py-4 text-zinc-300">
                            {entry.transactionType}
                        </td>

                        <td className="px-5 py-4">
                <span
                    className={
                        entry.entryType === "CREDIT"
                            ? "rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300"
                            : "rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1 text-xs font-medium text-red-300"
                    }
                >
                  {entry.entryType}
                </span>
                        </td>

                        <td className="px-5 py-4 font-medium text-zinc-100">
                            {entry.amount.toLocaleString("en-IN")}
                        </td>

                        <td className="px-5 py-4 font-medium text-zinc-100">
                            {entry.balanceAfter.toLocaleString("en-IN")}
                        </td>

                        <td className="px-5 py-4 text-zinc-400">
                            {formatDateTime(entry.createdAt)}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

function formatDateTime(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "medium",
    });
}