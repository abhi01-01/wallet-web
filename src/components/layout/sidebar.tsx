"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Activity,
    // BadgeIndianRupee,
    ChevronsLeft,
    ChevronsRight,
    CreditCard,
    Database,
    Gift,
    LayoutDashboard,
    RadioTower,
    UserCircle,
    Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

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
    const pathname = usePathname();
    const { isCollapsed, toggleSidebar } = useSidebar();
    const ToggleIcon = isCollapsed ? ChevronsRight : ChevronsLeft;

    return (
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-30 overflow-y-auto border-r border-white/10 bg-zinc-950 py-6 transition-[width,padding] duration-200 ease-out",
                isCollapsed
                    ? "w-20 px-2 sm:w-24 sm:px-3"
                    : "w-[min(18rem,calc(100vw-2rem))] px-4 md:w-72 md:px-5"
            )}
        >
            <div
                className={cn(
                    "flex gap-3",
                    isCollapsed
                        ? "flex-col items-center"
                        : "items-start justify-between"
                )}
            >
                <Link
                    href="/dashboard"
                    aria-label="Wallet Console dashboard"
                    className={cn("block min-w-0", isCollapsed && "text-center")}
                >
                    <div className="text-sm uppercase tracking-[0.35em] text-zinc-500">
                        Wallet
                    </div>
                    <div
                        className={cn(
                            "mt-2 font-semibold tracking-tight",
                            isCollapsed ? "text-sm" : "text-2xl"
                        )}
                    >
                        Console
                    </div>
                </Link>

                <button
                    type="button"
                    onClick={toggleSidebar}
                    aria-controls="wallet-primary-navigation"
                    aria-expanded={!isCollapsed}
                    aria-label={isCollapsed ? "Expand sidebar" : "Minimize sidebar"}
                    title={isCollapsed ? "Expand sidebar" : "Minimize sidebar"}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-zinc-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
                >
                    <ToggleIcon className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            <nav
                id="wallet-primary-navigation"
                aria-label="Primary navigation"
                className={cn("space-y-1", isCollapsed ? "mt-8" : "mt-10")}
            >
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={item.label}
                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                                "flex rounded-xl text-sm transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                                isCollapsed
                                    ? "min-h-12 flex-col items-center justify-center gap-1 px-2 py-2 text-center"
                                    : "items-center gap-3 px-3 py-2.5",
                                isActive
                                    ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                                    : "text-zinc-300"
                            )}
                        >
                            <Icon
                                className={cn(
                                    "h-4 w-4 shrink-0",
                                    isActive && "text-emerald-300"
                                )}
                                aria-hidden="true"
                            />
                            <span
                                className={cn(
                                    "min-w-0",
                                    isCollapsed && !isActive && "sr-only",
                                    isCollapsed &&
                                        isActive &&
                                        "max-w-full break-words text-[11px] font-medium leading-tight",
                                    !isCollapsed && "truncate"
                                )}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
