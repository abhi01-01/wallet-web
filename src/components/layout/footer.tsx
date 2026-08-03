import Link from "next/link";
import {
    ExternalLink,
    Wallet,
} from "lucide-react";

const platformBadges = ["Protected workspace", "Gateway routed", "Audit focused"];

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-zinc-950 px-8 py-7">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
                            <Wallet className="h-5 w-5" aria-hidden="true" />
                        </span>

                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-white">Wallet Console</p>
                            <p className="mt-1 text-xs text-zinc-500">
                                Internal platform
                            </p>
                        </div>
                    </div>

                    <div className="hidden h-8 w-px bg-white/10 sm:block" />

                    <div className="flex flex-wrap gap-2">
                        {platformBadges.map((badge) => (
                            <span
                                key={badge}
                                className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-400"
                            >
                                {badge}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:justify-end">
                    <p className="text-xs text-zinc-500">
                        Copyright 2026 Wallet Console
                    </p>

                    <div className="hidden h-4 w-px bg-white/10 sm:block" />

                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs uppercase tracking-[0.22em] text-zinc-600">
                            Developed by
                        </span>

                        <Link
                            href="https://www.linkedin.com/in/abhishek0105"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:border-emerald-300/50 hover:bg-emerald-400/15 hover:text-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
                        >
                            Abhishek Singh
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
