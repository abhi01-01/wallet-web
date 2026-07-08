import { cn } from "@/lib/utils";

type StatusBadgeProps = {
    status: string;
};

const statusClasses: Record<string, string> = {
    PENDING: "border-yellow-400/30 bg-yellow-400/10 text-yellow-200",
    PUBLISHING: "border-blue-400/30 bg-blue-400/10 text-blue-200",
    PUBLISHED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    FAILED: "border-orange-400/30 bg-orange-400/10 text-orange-200",
    DEAD: "border-red-400/30 bg-red-400/10 text-red-200",
    CREDIT: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    DEBIT: "border-red-400/30 bg-red-400/10 text-red-200",
    ACTIVE: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
};

export function StatusBadge({ status }: StatusBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
                statusClasses[status] ??
                "border-white/10 bg-white/5 text-zinc-300"
            )}
        >
      {status}
    </span>
    );
}