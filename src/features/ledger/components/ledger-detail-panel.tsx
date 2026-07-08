import { Card } from "@/components/ui/card";
import { DetailRow } from "@/components/ui/detail-row";
import { JsonBlock } from "@/components/ui/json-block";
import type { NormalizedLedgerEntry } from "../types";

type LedgerDetailPanelProps = {
    entry: NormalizedLedgerEntry | null;
};

export function LedgerDetailPanel({ entry }: LedgerDetailPanelProps) {
    if (!entry) {
        return (
            <Card>
                <p className="text-sm font-medium text-white">Ledger entry details</p>
                <p className="mt-1 text-sm text-zinc-500">
                    Select a ledger row to inspect entry details.
                </p>

                <div className="mt-8 rounded-xl border border-dashed border-white/10 p-6 text-sm text-zinc-500">
                    No ledger entry selected.
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <p className="text-sm font-medium text-white">Ledger entry details</p>
            <p className="mt-1 text-sm text-zinc-500">
                Details returned by the ledger API.
            </p>

            <div className="mt-6 space-y-4 text-sm">
                <DetailRow label="Entry ID" value={entry.entryId} />
                <DetailRow label="Transaction ID" value={entry.transactionId} />
                <DetailRow label="Transaction Type" value={entry.transactionType} />
                <DetailRow label="Entry Type" value={entry.entryType} />
                <DetailRow
                    label="Amount"
                    value={entry.amount.toLocaleString("en-IN")}
                />
                <DetailRow
                    label="Balance After"
                    value={entry.balanceAfter.toLocaleString("en-IN")}
                />
                <DetailRow label="Created At" value={formatDateTime(entry.createdAt)} />
            </div>

            <div className="mt-6">
                <JsonBlock title="Raw ledger entry" value={entry} />
            </div>
        </Card>
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
