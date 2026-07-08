import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";

const modules = [
    {
        title: "Wallets",
        description: "Inspect wallet balances, owner identity, assets, and status.",
        href: "/wallets",
    },
    {
        title: "Messaging - (SYSTEM only)",
        description: "Track transactional outbox and Kafka audit consumer state.",
        href: "/admin/messaging",
    },
    {
        title: "Outbox Events - (SYSTEM only)",
        description: "Inspect Kafka publishing lifecycle and retry state.",
        href: "/admin/messaging/outbox",
    },
    {
        title: "Kafka Audit - (SYSTEM only)",
        description: "Verify consumed Kafka events and audit payloads.",
        href: "/admin/messaging/kafka-audit",
    },
];

export default function DashboardPage() {
    return (
        <AppShell>
            <div>
                <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                    Overview
                </p>
                <h2 className="mt-3 text-4xl font-semibold tracking-tight">
                    Wallet Platform Dashboard
                </h2>
                <p className="mt-4 max-w-2xl text-zinc-400">
                    Monitor wallet balances, double-entry ledger movement, transaction
                    lifecycle, Kafka outbox publishing, and audit consumption from one
                    console.
                </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {modules.map((module) => (
                    <Link key={module.href} href={module.href}>
                        <Card className="h-full transition hover:border-emerald-400/30 hover:bg-emerald-400/5">
                            <p className="text-lg font-medium text-white">{module.title}</p>
                            <p className="mt-3 text-sm leading-6 text-zinc-500">
                                {module.description}
                            </p>
                        </Card>
                    </Link>
                ))}
            </div>
        </AppShell>
    );
}