"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { JsonBlock } from "@/components/ui/json-block";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import {
    getOutboxEventById,
    getOutboxEvents,
} from "@/features/messaging/api";
import type { OutboxStatus } from "@/features/messaging/types";

const statuses: Array<"ALL" | OutboxStatus> = [
    "ALL",
    "PENDING",
    "PUBLISHING",
    "PUBLISHED",
    "FAILED",
    "DEAD",
];

export default function OutboxEventsPage() {
    const [page, setPage] = useState(0);
    const [status, setStatus] = useState<"ALL" | OutboxStatus>("ALL");
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    const eventsQuery = useQuery({
        queryKey: ["outbox-events", page, status],
        queryFn: () =>
            getOutboxEvents({
                page,
                size: 10,
                status: status === "ALL" ? undefined : status,
            }),
    });

    const detailQuery = useQuery({
        queryKey: ["outbox-event-detail", selectedEventId],
        queryFn: () => getOutboxEventById(selectedEventId as string),
        enabled: Boolean(selectedEventId),
    });

    const events = eventsQuery.data;

    return (
        <AppShell allowedRoles={["SYSTEM"]}>
            <div className="flex items-start justify-between gap-6">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                        Transactional Outbox
                    </p>
                    <h2 className="mt-3 text-4xl font-semibold tracking-tight">
                        Outbox Events
                    </h2>
                    <p className="mt-4 max-w-3xl text-zinc-400">
                        Inspect wallet transaction events before and after Kafka publishing.
                        This table shows publish state, retry attempts, and failures.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => eventsQuery.refetch()}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_460px]">
                <Card className="overflow-hidden p-0">
                    <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                        <div>
                            <p className="font-medium text-white">Outbox event stream</p>
                            <p className="mt-1 text-sm text-zinc-500">
                                Filter by publish lifecycle status.
                            </p>
                        </div>

                        <select
                            value={status}
                            onChange={(event) => {
                                setStatus(event.target.value as "ALL" | OutboxStatus);
                                setPage(0);
                            }}
                            className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white outline-none"
                        >
                            {statuses.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    {eventsQuery.isLoading ? (
                        <div className="p-6 text-sm text-zinc-500">Loading outbox events...</div>
                    ) : null}

                    {eventsQuery.isError ? (
                        <div className="p-6 text-sm text-red-300">
                            Failed to load outbox events. Check SYSTEM token and gateway route.
                        </div>
                    ) : null}

                    {events && events.content.length === 0 ? (
                        <div className="p-6 text-sm text-zinc-500">No outbox events found.</div>
                    ) : null}

                    {events && events.content.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[980px] text-left text-sm">
                                    <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-[0.18em] text-zinc-500">
                                    <tr>
                                        <th className="px-5 py-4">Status</th>
                                        <th className="px-5 py-4">Event Type</th>
                                        <th className="px-5 py-4">Aggregate</th>
                                        <th className="px-5 py-4">Attempts</th>
                                        <th className="px-5 py-4">Created</th>
                                        <th className="px-5 py-4">Published</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {events.content.map((event) => (
                                        <tr
                                            key={event.eventId}
                                            onClick={() => setSelectedEventId(event.eventId)}
                                            className="cursor-pointer border-b border-white/10 transition hover:bg-white/[0.04]"
                                        >
                                            <td className="px-5 py-4">
                                                <StatusBadge status={event.status} />
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-zinc-200">
                                                    {event.eventType}
                                                </p>
                                                <p className="mt-1 max-w-xs truncate text-xs text-zinc-500">
                                                    {event.eventId}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-zinc-300">{event.aggregateType}</p>
                                                <p className="mt-1 max-w-xs truncate text-xs text-zinc-500">
                                                    {event.aggregateId}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 text-zinc-300">
                                                {event.publishAttempts}
                                            </td>
                                            <td className="px-5 py-4 text-zinc-400">
                                                {formatDate(event.createdAt)}
                                            </td>
                                            <td className="px-5 py-4 text-zinc-400">
                                                {event.publishedAt ? formatDate(event.publishedAt) : "-"}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            <PaginationBar
                                page={events.page}
                                totalPages={events.totalPages}
                                totalElements={events.totalElements}
                                onPageChange={setPage}
                            />
                        </>
                    ) : null}
                </Card>

                <Card>
                    <p className="text-sm font-medium text-white">Event details</p>
                    <p className="mt-1 text-sm text-zinc-500">
                        Select a row to inspect payload and headers.
                    </p>

                    {!selectedEventId ? (
                        <div className="mt-8 rounded-xl border border-dashed border-white/10 p-6 text-sm text-zinc-500">
                            No event selected.
                        </div>
                    ) : null}

                    {detailQuery.isLoading ? (
                        <div className="mt-8 text-sm text-zinc-500">Loading details...</div>
                    ) : null}

                    {detailQuery.isError ? (
                        <div className="mt-8 text-sm text-red-300">
                            Failed to load event detail.
                        </div>
                    ) : null}

                    {detailQuery.data ? (
                        <div className="mt-6 space-y-6">
                            <div className="space-y-2 text-sm">
                                <p>
                                    <span className="text-zinc-500">Event ID:</span>{" "}
                                    <span className="break-all text-zinc-300">
                    {detailQuery.data.eventId}
                  </span>
                                </p>
                                <p>
                                    <span className="text-zinc-500">Topic:</span>{" "}
                                    {detailQuery.data.topic}
                                </p>
                                <p>
                                    <span className="text-zinc-500">Key:</span>{" "}
                                    <span className="break-all">{detailQuery.data.eventKey}</span>
                                </p>
                                {detailQuery.data.lastError ? (
                                    <p className="text-red-300">
                                        <span className="text-zinc-500">Error:</span>{" "}
                                        {detailQuery.data.lastError}
                                    </p>
                                ) : null}
                            </div>

                            <JsonBlock title="Payload" value={detailQuery.data.payload} />
                            <JsonBlock title="Headers" value={detailQuery.data.headers} />
                        </div>
                    ) : null}
                </Card>
            </div>
        </AppShell>
    );
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}