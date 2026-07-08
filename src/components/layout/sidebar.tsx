import Link from "next/link";
import {
    Activity,
    // BadgeIndianRupee,
    Database,
    LayoutDashboard,
    RadioTower,
    Wallet,
    CreditCard,
    Gift, UserCircle
} from "lucide-react";

const navItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Wallets",
        href: "/wallets",
        icon: Wallet,
    },
    // {
    //     label: "Transactions",
    //     href: "/transactions",
    //     icon: BadgeIndianRupee,
    // },
    {
        label: "Ledger",
        href: "/ledger",
        icon: Database,
    },
    {
        label: "Messaging",
        href: "/admin/messaging",
        icon: RadioTower,
    },
    {
        label: "Outbox",
        href: "/admin/messaging/outbox",
        icon: Activity,
    },
    {
        label: "Kafka Audit",
        href: "/admin/messaging/kafka-audit",
        icon: RadioTower,
    },
    {
        label: "Payments",
        href: "/payments",
        icon: CreditCard,
    },
    {
        label: "Wallet Actions",
        href: "/wallet-actions",
        icon: Gift,
    },
    {
        label: "Profile",
        href: "/profile",
        icon: UserCircle,
    }
];

export function Sidebar() {
    return (
        <aside className="fixed inset-y-0 left-0 w-72 border-r border-white/10 bg-zinc-950 px-5 py-6">
            <Link href="/dashboard" className="block">
                <div className="text-sm uppercase tracking-[0.35em] text-zinc-500">
                    Wallet
                </div>
                <div className="mt-2 text-2xl font-semibold tracking-tight">
                    Console
                </div>
            </Link>

            <nav className="mt-10 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}